"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Camera, RefreshCw, X, Check, FlipHorizontal, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { UploadedFile } from "@/hooks/useFileUpload";
import { useAI } from "@/context/aicontext";

interface LiveCameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File, isValidated: boolean) => void;
  title?: string;
  type?: UploadedFile["type"] | null;
}

export const LiveCameraModal = ({
  open,
  onOpenChange,
  onCapture,
  title = "Capture Live Photo",
  type,
}: LiveCameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isValidatedAtCapture, setIsValidatedAtCapture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  
  // AI State from Context
  const { model, isModelLoading, error: aiError } = useAI();
  const [detections, setDetections] = useState<cocoSsd.DetectedObject[]>([]);
  const [brightness, setBrightness] = useState<number>(0);
  const [isValidatedNow, setIsValidatedNow] = useState(false);
  const [guidance, setGuidance] = useState<{ message: string; type: "info" | "warning" | "success" }>({
    message: isModelLoading ? "AI is initializing..." : "Initializing AI guidance...",
    type: "info",
  });

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

        // Guidance Logic
        let message = "Scanning...";
        let gType: "info" | "warning" | "success" = "info";
        let isValid = false;

        if (b < 30) {
          message = "Too dark! Find better lighting.";
          gType = "warning";
        } else if (b > 230) {
          message = "Too bright! Avoid direct light.";
          gType = "warning";
        } else {
          const labels = predictions.map(p => p.class.toLowerCase());
          
          const isKitchen = type === "kitchen";
          const isToilet = type === "rest_room";
          const isOutside = type === "exterior_shot" || type === "compound_road";

          if (isKitchen) {
            const kitchenObjects = ["sink", "refrigerator", "microwave", "oven", "toaster", "dining table", "bottle", "cup", "bowl", "chair"];
            const found = predictions.find(p => kitchenObjects.includes(p.class.toLowerCase()));
            if (found) {
              message = `KITCHEN: ${found.class.toUpperCase()} detected!`;
              gType = "success";
              isValid = true;
            } else {
              message = "Kitchen: Target sink, fridge, or stove";
            }
          } else if (isToilet) {
            const toiletObjects = ["toilet", "sink"];
            const found = predictions.find(p => toiletObjects.includes(p.class.toLowerCase()));
            if (found) {
              message = `RESTROOM: ${found.class.toUpperCase()} detected!`;
              gType = "success";
              isValid = true;
            } else {
              message = "Restroom: Center the toilet or sink";
            }
          } else if (isOutside) {
            // Compound or Compound Road
            const outdoorObjects = ["car", "truck", "bus", "traffic light", "bench", "bicycle", "motorcycle", "person"];
            const found = predictions.find(p => outdoorObjects.includes(p.class.toLowerCase()));
            if (found) {
              message = `${type === "compound_road" ? "ROAD" : "COMPOUND"}: ${found.class.toUpperCase()} detected!`;
              gType = "success";
              isValid = true;
            } else {
              message = type === "compound_road" ? "Road: Capture driveway/street" : "Compound: Show building surroundings";
            }
          } else if (type === "living_room" || type === "bedroom") {
            // Can be empty, but highlight what we see
            const roomObjects = ["bed", "couch", "chair", "tv", "potted plant", "book", "vase"];
            const found = predictions.find(p => roomObjects.includes(p.class.toLowerCase()));
            if (found) {
              message = `${type.replace('_', ' ').toUpperCase()}: ${found.class.toUpperCase()} detected!`;
              gType = "success";
            } else {
              message = `${type.replace('_', ' ').split(' ')[0]} ready (Empty room okay)`;
              gType = "success";
            }
            isValid = true;
          } else {
            message = "Ready for capture.";
            gType = "success";
            isValid = true;
          }
        }

        setGuidance({ message, type: gType });
        setIsValidatedNow(isValid);
      } catch (err) {
        console.error("Detection error:", err);
      }
    }
    
    // Request next frame ONLY AFTER current one is processed (with a tiny delay to breathe)
    if (open && !capturedImage) {
      setTimeout(() => {
        requestAnimationFrame(runDetection);
      }, 100); // 10fps is plenty for guidance and much lighter on CPU
    }
  }, [model, capturedImage, type, open]);

  useEffect(() => {
    if (open && model && !capturedImage) {
      const animationId = requestAnimationFrame(runDetection);
      return () => cancelAnimationFrame(animationId);
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
        setIsValidatedAtCapture(isValidatedNow);
        
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsValidatedAtCapture(false);
    startCamera();
  };

  const handleDone = () => {
    if (capturedImage) {
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `AI_capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file, isValidatedAtCapture);
          onOpenChange(false);
          setCapturedImage(null);
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
                <div className={`px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all duration-300 ${
                  guidance.type === "warning" ? "bg-red-500/80 text-white" : 
                  guidance.type === "success" ? "bg-green-500/80 text-white" : 
                  "bg-white/20 text-white"
                }`}>
                  {guidance.type === "warning" ? <AlertCircle className="h-4 w-4" /> : 
                   guidance.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : 
                   <Info className="h-4 w-4" />}
                  <span className="text-xs font-bold font-raleway">{guidance.message}</span>
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

        <div className="p-8 bg-gradient-to-t from-black to-black/40 flex items-center justify-center gap-6 relative z-10">
          {!capturedImage ? (
            <>
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
                  isValidatedNow ? 'bg-green-500 opacity-75' : 'bg-primary'
                }`} />
                <Button
                  size="icon"
                  className={`h-20 w-20 rounded-full text-black hover:scale-105 active:scale-95 transition-all shadow-2xl relative border-8 border-black ${
                    guidance.type === 'warning' ? 'bg-gray-300' : 'bg-white'
                  }`}
                  onClick={handleCapture}
                >
                  <Camera className={`h-10 w-10 ${isValidatedNow ? 'text-green-600' : ''}`} />
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
            </>
          ) : (
            <div className="flex w-full gap-4 animate-in slide-in-from-bottom-4">
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-xl text-white border-white/20 bg-white/5 hover:bg-white/10"
                onClick={handleRetake}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button
                className="flex-1 h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
                onClick={handleDone}
              >
                <Check className="mr-2 h-5 w-5" />
                Continue
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
