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
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { UploadedFile } from "@/hooks/useFileUpload";

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
  
  // AI State
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [detections, setDetections] = useState<cocoSsd.DetectedObject[]>([]);
  const [brightness, setBrightness] = useState<number>(0);
  const [isValidatedNow, setIsValidatedNow] = useState(false);
  const [guidance, setGuidance] = useState<{ message: string; type: "info" | "warning" | "success" }>({
    message: "Initializing AI guidance...",
    type: "info",
  });

  // Load Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        await tf.ready();
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log("AI Model loaded successfully");
      } catch (err) {
        console.error("Failed to load AI model:", err);
        setGuidance({ message: "AI guidance unavailable", type: "warning" });
      } finally {
        setIsModelLoading(false);
      }
    };
    if (open) loadModel();
  }, [open]);

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
    if (model && videoRef.current && videoRef.current.readyState === 4 && !capturedImage) {
      const video = videoRef.current;
      
      // Detection
      const predictions = await model.detect(video);
      setDetections(predictions);
      
      // Quality Check
      const b = calculateBrightness(video);
      setBrightness(b);

      // Guidance Logic
      let message = "Scanning environment...";
      let gType: "info" | "warning" | "success" = "info";
      let isValid = false;

      if (b < 40) {
        message = "Too dark! Find better lighting.";
        gType = "warning";
      } else if (b > 220) {
        message = "Too bright! Avoid direct light.";
        gType = "warning";
      } else {
        const labels = predictions.map(p => p.class.toLowerCase());
        
        const isKitchen = type === "kitchen";
        const isToilet = type === "rest_room";
        const isOutside = type === "exterior_shot" || type === "compound_road";

        if (isKitchen) {
          const kitchenObjects = ["sink", "refrigerator", "microwave", "oven", "toaster", "dining table"];
          const found = predictions.find(p => kitchenObjects.includes(p.class.toLowerCase()));
          if (found) {
            message = `Kitchen ${found.class} detected!`;
            gType = "success";
            isValid = true;
          } else {
            message = "Target a kitchen area (sink, fridge, oven).";
          }
        } else if (isToilet) {
          if (labels.includes("toilet") || labels.includes("sink")) {
            message = "Bathroom fixtures detected!";
            gType = "success";
            isValid = true;
          } else {
            message = "Center the toilet or sink in the frame.";
          }
        } else if (isOutside) {
          const outsideObjects = ["car", "truck", "bus", "traffic light", "bench", "bicycle"];
          const found = predictions.find(p => outsideObjects.includes(p.class.toLowerCase()));
          if (found) {
            message = `Outside environment detected!`;
            gType = "success";
            isValid = true;
          } else {
            message = "Ensuring it's an outside shot. Look for vehicles or wide space.";
          }
        } else {
          message = "Ready for capture.";
          gType = "success";
          isValid = true;
        }
      }

      setGuidance({ message, type: gType });
      setIsValidatedNow(isValid);
      requestAnimationFrame(runDetection);
    }
  }, [model, capturedImage, type]);

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
                  className="absolute border-2 border-primary/50 pointer-events-none rounded hidden sm:block"
                  style={{
                    left: `${(det.bbox[0] / (videoRef.current?.videoWidth || 1)) * 100}%`,
                    top: `${(det.bbox[1] / (videoRef.current?.videoHeight || 1)) * 100}%`,
                    width: `${(det.bbox[2] / (videoRef.current?.videoWidth || 1)) * 100}%`,
                    height: `${(det.bbox[3] / (videoRef.current?.videoHeight || 1)) * 100}%`
                  }}
                >
                  <span className="bg-primary text-white text-[8px] px-1 absolute -top-4 left-0 rounded-sm">
                    {det.class}
                  </span>
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
