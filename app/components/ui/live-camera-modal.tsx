"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Camera, RefreshCw, X, Check, FlipHorizontal } from "lucide-react";

interface LiveCameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
  title?: string;
}

export const LiveCameraModal = ({
  open,
  onOpenChange,
  onCapture,
  title = "Capture Live Photo",
}: LiveCameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
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
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        
        // Stop the stream after capture
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleDone = () => {
    if (capturedImage) {
      // Convert base64 to file
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file);
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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none">
        <DialogHeader className="p-4 bg-white/10 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
          <DialogTitle className="text-white text-center font-raleway font-bold">
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
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-6 bg-white/10 backdrop-blur-md flex items-center justify-center gap-6">
          {!capturedImage ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-white hover:bg-white/20"
                onClick={toggleCamera}
              >
                <FlipHorizontal className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                className="h-16 w-16 rounded-full bg-white text-black hover:bg-white/90 shadow-xl border-4 border-white/30"
                onClick={handleCapture}
              >
                <Camera className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-white hover:bg-white/20"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1 text-white border-white hover:bg-white/20"
                onClick={handleRetake}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold"
                onClick={handleDone}
              >
                <Check className="mr-2 h-4 w-4" />
                Use Photo
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
