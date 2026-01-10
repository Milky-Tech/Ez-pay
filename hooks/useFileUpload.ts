"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";

export interface UploadedFile {
  id: string;
  file: File;
  url: string | null;
  uploading: boolean;
  error: string | null;
  type: "compound_road" | "power_system" | "exterior_shot" | "interior_rooms";
}

export const useFileUpload = (token: string | null) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const uploadFile = async (
    file: File,
    type: string,
    endpoint: string = "upload/single"
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    // Map internal types to generic 'image' or 'document' for the API if needed
    const apiType = ["compound_road", "power_system", "exterior_shot", "interior_rooms"].includes(type) ? "image" : "document";
    formData.append("type", apiType);

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const data = await response.json();
    return (
      data.url || 
      data.path || 
      data.filePath || 
      data.data?.url || 
      data.data?.path || 
      `/storage/uploads/${apiType === "image" ? "images" : "documents"}/${file.name}`
    );
  };

  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      try {
        const url = await uploadFile(file, "interior_rooms");
        urls.push(url);
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        // Continue with other files or handle as needed
      }
    }
    return urls;
  };

  const handleFileUpload = async (
    file: File,
    type: UploadedFile["type"],
    isMultiple: boolean = false,
    onSuccess?: (url: string) => void
  ) => {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newFile: UploadedFile = {
      id,
      file,
      url: null,
      uploading: true,
      error: null,
      type,
    };

    if (!isMultiple) {
      setUploadedFiles((prev) => prev.filter((f) => f.type !== type));
    }

    setUploadedFiles((prev) => [...prev, newFile]);

    try {
      let url: string;
      if (isMultiple && type === "interior_rooms") {
        const urls = await uploadMultipleFiles([file]);
        url = urls[0];
      } else {
        url = await uploadFile(file, type);
      }

      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, url, uploading: false } : f))
      );

      if (onSuccess) onSuccess(url);

      toast({
        title: "Upload Successful",
        description: "File uploaded successfully",
      });
      return url;
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, uploading: false, error: "Failed to upload file" }
            : f
        )
      );
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
      });
      return null;
    }
  };

  const handleBulkInteriorUpload = async (
    files: File[],
    onSuccess?: (urls: string[]) => void
  ) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: `interior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      url: null,
      uploading: true,
      error: null,
      type: "interior_rooms",
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    try {
      const urls = await uploadMultipleFiles(files);

      const updatedFiles = newFiles.map((file, index) => ({
        ...file,
        url: urls[index] || null,
        uploading: false,
      }));

      setUploadedFiles((prev) => [
        ...prev.filter((f) => !newFiles.some((nf) => nf.id === f.id)),
        ...updatedFiles,
      ]);

      if (onSuccess) onSuccess(urls.filter((url) => url));

      toast({
        title: "Upload Successful",
        description: `${files.length} interior photos uploaded`,
      });
      return urls;
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) => {
          const newFile = newFiles.find((nf) => nf.id === f.id);
          if (newFile) {
            return { ...f, uploading: false, error: "Failed to upload file" };
          }
          return f;
        })
      );
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload interior photos",
      });
      return null;
    }
  };

  const removeFile = (id: string) => {
    const fileToRemove = uploadedFiles.find((f) => f.id === id);
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    return fileToRemove;
  };

  const clearUploads = () => {
    setUploadedFiles([]);
  };

  return {
    uploadedFiles,
    handleFileUpload,
    handleBulkInteriorUpload,
    removeFile,
    clearUploads,
    getFileByType: (type: UploadedFile["type"]) => uploadedFiles.find((f) => f.type === type),
    getInteriorRoomFiles: () => uploadedFiles.filter((f) => f.type === "interior_rooms"),
  };
};
