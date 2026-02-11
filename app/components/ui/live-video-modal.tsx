"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Video, RefreshCw, X, Check, FlipHorizontal, Loader2, Play, Circle } from "lucide-react";

interface LiveVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File) => void;
  title?: string;
  maxDuration?: number; // in seconds
}

export const LiveVideoModal = ({
  open,
  onOpenChange,
  onCapture,
  title = "Record Verification Video",
  maxDuration = 10,
}: LiveVideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [countdown, setCountdown] = useState(maxDuration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.muted = true;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera/microphone. Please ensure you have given permission.");
    }
  };

  useEffect(() => {
    if (open && !videoUrl) {
      startCamera();
    }
    return () => {
      stopTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, facingMode]);

  const stopTracks = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const startRecording = () => {
    if (!stream) return;
    setRecordedChunks([]);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp8,opus",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setCountdown(maxDuration);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleRetake = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setRecordedChunks([]);
    startCamera();
  };

  const handleDone = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const file = new File([blob], `verification_video_${Date.now()}.webm`, {
        type: "video/webm",
      });
      onCapture(file);
      onOpenChange(false);
      resetState();
    }
  };

  const resetState = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setRecordedChunks([]);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    // When chunks are ready and recording stopped, generate URL if not already done
    if (!isRecording && recordedChunks.length > 0 && !videoUrl) {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
    }
  }, [isRecording, recordedChunks, videoUrl]);

  return (
    <Dialog open={open} onOpenChange={(val) => {
        if (!val) resetState();
        onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none sm:rounded-2xl">
        <DialogHeader className="p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20">
          <DialogTitle className="text-white text-center font-raleway font-bold flex items-center justify-center gap-2">
            <Video className="h-5 w-5 text-red-500" />
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
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
              />
              
              {isRecording && (
                <div className="absolute top-16 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  {countdown}s
                </div>
              )}

              <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 flex flex-col items-center justify-end pb-24">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-white/20 text-white">
                  <span className="text-xs font-bold font-raleway">
                    {isRecording ? "Recording..." : "Positions yourself in the frame"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-8 bg-gradient-to-t from-black to-black/40 flex items-center justify-center gap-6 relative z-10">
          {!videoUrl ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                onClick={toggleCamera}
                disabled={isRecording}
              >
                <FlipHorizontal className="h-6 w-6" />
              </Button>
              
              <Button
                size="icon"
                className={`h-20 w-20 rounded-full text-white transition-all shadow-2xl relative border-8 border-black ${
                  isRecording ? "bg-red-600 scale-110" : "bg-white text-black"
                }`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <div className="h-8 w-8 bg-white rounded-sm" /> : <Circle className="h-10 w-10 fill-red-600 text-red-600" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => onOpenChange(false)}
                disabled={isRecording}
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
                Finish
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
