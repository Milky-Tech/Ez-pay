"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Camera, RefreshCw, X, Check, FlipHorizontal, AlertCircle, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { UploadedFile } from "@/hooks/useFileUpload";
import { useAI } from "@/context/aicontext";
import { validateRoomFrame, RoomType, ValidationResult } from "@/lib/ai/room-validation";

interface LiveCameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File, isValidated: boolean, metadata?: any) => void;
  title?: string;
  type?: UploadedFile["type"] | null;
  packageType?: "prime" | "vantage";
}

export const LiveCameraModal = ({
  open,
  onOpenChange,
  onCapture,
  title = "Capture Live Photo",
  type,
  packageType = "prime",
}: LiveCameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isValidatedAtCapture, setIsValidatedAtCapture] = useState(false);
  const [captureMetadata, setCaptureMetadata] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  
  // AI State from Context
  const { model, isModelLoading, error: aiError } = useAI();
  const [detections, setDetections] = useState<cocoSsd.DetectedObject[]>([]);
  const [brightness, setBrightness] = useState<number>(0);
  const [currentValidation, setCurrentValidation] = useState<ValidationResult | null>(null);
  const [guidance, setGuidance] = useState<{ message: string; type: "info" | "warning" | "success" }>({
    message: isModelLoading ? "AI is initializing..." : "Initializing AI guidance...",
    type: "info",
  });
  const detectionRequestId = useRef<number | null>(null);

  // Reset all states when modal closes or opens
  useEffect(() => {
    if (!open) {
      setCapturedImage(null);
      setIsValidatedAtCapture(false);
      setCaptureMetadata(null);
      setDetections([]);
      setCurrentValidation(null);
      setGuidance({
        message: isModelLoading ? "AI is initializing..." : "Initializing AI guidance...",
        type: "info",
      });
      if (detectionRequestId.current) {
        cancelAnimationFrame(detectionRequestId.current);
        detectionRequestId.current = null;
      }
    }
  }, [open, isModelLoading]);

  // Guidance Update when model status changes
  useEffect(() => {
    if (aiError) {
      setGuidance({ message: "AI guidance unavailable", type: "warning" });
    } else if (isModelLoading) {
      setGuidance({ message: "AI is initializing...", type: "info" });
    } else if (model) {
      setGuidance({ message: "Scanning environment...", type: "info" });
    }
  }, [model, isModelLoading, aiError]);

  const calculateBrightness = (video: HTMLVideoElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    ctx.drawImage(video, 0, 0, 100, 100);
    const imageData = ctx.getImageData(0, 0, 100, 100);
    const data = imageData.data;
    let colorSum = 0;
    for (let x = 0; x < data.length; x += 4) {
      const avg = (data[x] + data[x + 1] + data[x + 2]) / 3;
      colorSum += avg;
    }
    return colorSum / (100 * 100);
  };

  const runDetection = useCallback(async () => {
    if (!open || capturedImage || !model) return;

    const video = videoRef.current;
    if (video && video.readyState === 4) {
      try {
        // Detection
        const predictions = await model.detect(video);
        setDetections(predictions);
        
        // Quality Check
        const b = calculateBrightness(video);
        setBrightness(b);

        // Map component type to validation room type
        let roomKey: RoomType = "living_room";
        if (type === "rest_room") roomKey = "restroom";
        else if (type === "kitchen") roomKey = "kitchen";
        else if (type === "bedroom") roomKey = "bedroom";
        else if (type === "living_room") roomKey = "living_room";
        else if (type === "compound_road") roomKey = "compound_road";
        else if (type === "exterior_shot") roomKey = "exterior_shot";
        else if (type === "compound") roomKey = "compound";
        else if (type === "power_system") roomKey = "power_system";

        const result = validateRoomFrame(predictions, roomKey, b);
        setCurrentValidation(result);

        // Guidance Logic
        let message = result.user_hint;
        let gType: "info" | "warning" | "success" = result.scene_match ? "success" : "info";

        if (b < 30 || b > 230) gType = "warning";

        setGuidance({ message, type: gType });
      } catch (err) {
        console.error("Detection error:", err);
      }
    }
    
    // Request next frame ONLY IF modal is still open and no image captured
    if (open && !capturedImage) {
      detectionRequestId.current = requestAnimationFrame(runDetection);
    }
  }, [model, capturedImage, type, open]);

  useEffect(() => {
    if (open && model && !capturedImage) {
      detectionRequestId.current = requestAnimationFrame(runDetection);
      return () => {
        if (detectionRequestId.current) {
          cancelAnimationFrame(detectionRequestId.current);
          detectionRequestId.current = null;
        }
      };
    }
  }, [open, model, capturedImage, runDetection]);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure you have given permission.");
    }
  };

  useEffect(() => {
    if (open && !capturedImage) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open, facingMode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageData);
        setIsValidatedAtCapture(currentValidation?.scene_match || false);
        setCaptureMetadata(currentValidation);
        
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsValidatedAtCapture(false);
    setCaptureMetadata(null);
    startCamera();
  };

  const handleDone = (force: boolean = false) => {
    if (capturedImage) {
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `AI_capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file, force ? false : isValidatedAtCapture, captureMetadata);
          onOpenChange(false);
          setCapturedImage(null);
          setCaptureMetadata(null);
        });
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none sm:rounded-2xl">
        <DialogHeader className="p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20">
          <DialogTitle className="text-white text-center font-raleway font-bold flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-[3/4] bg-black flex items-center justify-center">
          {error ? (
            <div className="p-6 text-center text-white space-y-4">
              <X className="h-12 w-12 text-red-500 mx-auto" />
              <p>{error}</p>
              <Button onClick={startCamera} variant="outline" className="text-white border-white hover:bg-white/10">
                Try Again
              </Button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
              />
              
              {/* Guidance Overlay */}
              <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 flex flex-col items-center justify-end pb-24">
                <div className={`px-4 py-2 rounded-full backdrop-blur-md flex flex-col items-center gap-1 transition-all duration-300 max-w-[85%] ${
                  guidance.type === "warning" ? "bg-red-500/80 text-white" : 
                  guidance.type === "success" ? "bg-green-500/80 text-white" : 
                  "bg-white/20 text-white"
                }`}>
                  <div className="flex items-center gap-2">
                    {guidance.type === "warning" ? <AlertCircle className="h-4 w-4" /> : 
                     guidance.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : 
                     <Info className="h-4 w-4" />}
                    <span className="text-xs font-bold font-raleway text-center">{guidance.message}</span>
                  </div>
                  
                  {currentValidation && currentValidation.missing_objects.length > 0 && (
                    <div className="text-[10px] opacity-90 flex flex-wrap justify-center gap-1 mt-1">
                      <span className="font-bold">Missing:</span>
                      {currentValidation.missing_objects.map((obj, i) => (
                        <span key={i} className="bg-black/20 px-1.5 rounded">{obj}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Detections Box */}
              {detections.map((det, i) => (
                <div 
                  key={i}
                  className="absolute border-2 border-primary/40 pointer-events-none rounded transition-all duration-200"
                  style={{
                    left: `${(det.bbox[0] / (videoRef.current?.videoWidth || 1)) * 100}%`,
                    top: `${(det.bbox[1] / (videoRef.current?.videoHeight || 1)) * 100}%`,
                    width: `${(det.bbox[2] / (videoRef.current?.videoWidth || 1)) * 100}%`,
                    height: `${(det.bbox[3] / (videoRef.current?.videoHeight || 1)) * 100}%`
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                    {det.class.toUpperCase()} ({Math.round(det.score * 100)}%)
                  </div>
                </div>
              ))}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-8 bg-gradient-to-t from-black to-black/40 flex flex-col items-center justify-center gap-6 relative z-10">
          {!capturedImage ? (
            <div className="flex items-center justify-center gap-6 w-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                onClick={toggleCamera}
              >
                <FlipHorizontal className="h-6 w-6" />
              </Button>
              <div className="relative group">
                <div className={`absolute -inset-1 rounded-full blur opacity-50 transition duration-500 ${
                  currentValidation?.scene_match ? 'bg-green-500 opacity-75' : 'bg-primary'
                }`} />
                <Button
                  size="icon"
                  className={`h-20 w-20 rounded-full text-black hover:scale-105 active:scale-95 transition-all shadow-2xl relative border-8 border-black ${
                    guidance.type === 'warning' ? 'bg-gray-300' : 'bg-white'
                  }`}
                  onClick={handleCapture}
                >
                  <Camera className={`h-10 w-10 ${currentValidation?.scene_match ? 'text-green-600' : ''}`} />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              {packageType === "prime" && !isValidatedAtCapture && (
                <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl text-white text-center animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-xs font-bold">Standard Not Met</span>
                  </div>
                  <p className="text-[10px] opacity-90">
                    This capture doesn't meet Ez-Prime standards. Please <b>Recapture</b> or switch to <b>Ez-Vantage</b> package to proceed.
                  </p>
                </div>
              )}
              
              <div className="flex w-full gap-4 animate-in slide-in-from-bottom-4">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-xl text-white border-white/20 bg-white/5 hover:bg-white/10"
                  onClick={handleRetake}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                
                {packageType === "prime" && !isValidatedAtCapture ? (
                  <Button
                    className="flex-1 h-14 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    onClick={() => handleDone(true)}
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Submit Anyway
                  </Button>
                ) : (
                  <Button
                    className="flex-1 h-14 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                    onClick={() => handleDone(false)}
                  >
                    <Check className="mr-2 h-5 w-5" />
                    Continue
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
