"use client";

import React, { useState } from "react";
import { useFileUpload, UploadedFile } from "@/hooks/useFileUpload";
import { LiveCameraModal } from "@/app/components/ui/live-camera-modal";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { 
  Trash2, 
  Upload, 
  Camera, 
  Plus, 
  Loader2, 
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminImageManagerProps {
  label: string;
  value: string | string[] | null;
  type: UploadedFile["type"];
  isMultiple?: boolean;
  onChange: (value: string | string[]) => void;
  token: string | null;
  accept?: string;
}

export default function AdminImageManager({
  label,
  value,
  type,
  isMultiple = false,
  onChange,
  token,
  accept = "image/*"
}: AdminImageManagerProps) {
  const { toast } = useToast();
  const { 
    handleFileUpload, 
    deleteFileFromServer,
    uploadedFiles 
  } = useFileUpload(token);

  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Normalize value to array
  const currentImages = Array.isArray(value) 
    ? value 
    : value 
      ? value.split(",").map(v => v.trim()).filter(Boolean)
      : [];

  const onUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    if (isMultiple) input.multiple = true;
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files?.length) return;

      setIsUploading(true);
      try {
        const files = Array.from(target.files);
        const newUrls: string[] = [];

        for (const file of files) {
          const url = await handleFileUpload(file, type, isMultiple);
          if (url) newUrls.push(url);
        }

        if (newUrls.length > 0) {
          if (isMultiple) {
            onChange([...currentImages, ...newUrls]);
          } else {
            onChange(newUrls[0]);
          }
        }
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  const handleCapture = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await handleFileUpload(file, type, isMultiple);
      if (url) {
        if (isMultiple) {
          onChange([...currentImages, url]);
        } else {
          onChange(url);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    // 1. Confirm deletion
    if (!confirm("Are you sure you want to permanently delete this image from the server?")) return;

    // 2. Call server DELETE
    const success = await deleteFileFromServer(urlToRemove);
    if (success) {
      // 3. Update local state/property record
      if (isMultiple) {
        onChange(currentImages.filter(url => url !== urlToRemove));
      } else {
        onChange("");
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">{label}</label>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={onUploadClick}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={() => setIsCapturing(true)}
            disabled={isUploading}
          >
            <Camera className="h-3.5 w-3.5" />
            Camera
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 min-h-[120px]">
        {currentImages.length === 0 && !isUploading && (
          <div className="col-span-full flex flex-col items-center justify-center py-6 text-slate-400">
            <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-xs">No images uploaded yet</p>
          </div>
        )}

        {currentImages.map((url, index) => (
          <div key={index} className="relative aspect-square bg-white rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
            {url.toLowerCase().endsWith('.pdf') ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                <FileText className="h-8 w-8 mb-1" />
                <span className="text-[10px] font-bold">PDF DOC</span>
              </div>
            ) : (
              <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => handleRemove(url)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {index === 0 && !isMultiple && (
              <Badge className="absolute top-1 left-1 bg-white/90 text-slate-900 border-none text-[10px] h-4">Active</Badge>
            )}
          </div>
        ))}

        {isUploading && (
          <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center animate-pulse border border-slate-200">
            <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
          </div>
        )}
      </div>

      <LiveCameraModal 
        open={isCapturing}
        onOpenChange={setIsCapturing}
        onCapture={handleCapture}
        type={type}
        title={`Capture ${label}`}
        disableAI={true}
      />
    </div>
  );
}
