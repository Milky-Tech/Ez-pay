"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UploadedFile {
  id: string;
  file: File;
  url: string | null;
  uploading: boolean;
  error: string | null;
  aiValidated?: boolean; // Track if AI confirmed the contents
  aiMetadata?: any; // Detailed AI validation results (detected objects, confidence, missing)
  type:
    | "compound_road"
    | "power_system"
    | "exterior_shot"
    | "interior_rooms"
    | "living_room"
    | "bedroom"
    | "kitchen"
    | "rest_room"
    | "cac_cert"
    | "c_of_o"
    | "bank_statements"
    | "govt_id"
    | "live_photo"
    | "live_video"
    | "guarantor_id"
    | "attestation_letter"
    | "others";
}

export const useFileUpload = (token: string | null) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const uploadFile = async (
    file: File,
    type: string,
    endpoint: string = "upload/single",
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    // Map internal types to generic 'image' or 'document' for the API if needed
    const imageTypes = [
      "compound_road",
      "power_system",
      "exterior_shot",
      "interior_rooms",
      "living_room",
      "bedroom",
      "kitchen",
      "rest_room",
      "live_photo",
      "govt_id",
      "guarantor_id",
      "others",
    ];
    let apiType = "document";
    if (type === "live_video") {
      apiType = "video";
    } else if (imageTypes.includes(type)) {
      apiType = "image";
    }
    formData.append("type", apiType);

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      `/storage/uploads/${apiType === "image" ? "images" : apiType === "video" ? "videos" : "documents"}/${file.name}`
    );
  };

  const bulkUploadFiles = async (
    files: File[],
    type: string = "image",
  ): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files[]", file);
    });
    formData.append("type", type);

    const response = await fetch(`${API_BASE_URL}/upload/bulk`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload bulk files");
    }

    const data = await response.json();
    return (
      data.urls ||
      data.paths ||
      data.filePaths ||
      data.data?.urls ||
      data.data?.paths ||
      []
    );
  };

  const handleFileUpload = async (
    file: File,
    type: UploadedFile["type"],
    isMultiple: boolean = false,
    onSuccess?: (url: string) => void,
    aiValidated: boolean = false,
    aiMetadata?: any,
    endpoint?: string,
  ) => {
    const id = `${type}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newFile: UploadedFile = {
      id,
      file,
      url: null,
      uploading: true,
      error: null,
      type,
      aiValidated,
      aiMetadata,
    };

    if (!isMultiple) {
      setUploadedFiles((prev) => prev.filter((f) => f.type !== type));
    }

    setUploadedFiles((prev) => [...prev, newFile]);

    try {
      const url = await uploadFile(file, type, endpoint);

      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, url, uploading: false } : f)),
      );

      if (onSuccess) onSuccess(url);

      toast({
        title: "Upload Successful",
        description: aiValidated
          ? "AI Validated! File uploaded successfully"
          : "File uploaded successfully",
      });
      return url;
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, uploading: false, error: "Failed to upload file" }
            : f,
        ),
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
    onSuccess?: (urls: string[]) => void,
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
      const urls = await bulkUploadFiles(files, "image");

      const updatedFiles = newFiles.map((file, index) => ({
        ...file,
        url: urls[index] || null,
        uploading: false,
      }));

      setUploadedFiles((prev) => [
        ...prev.filter((f) => !newFiles.some((nf) => nf.id === f.id)),
        ...updatedFiles,
      ]);

      const validUrls = urls.filter((url) => url);
      if (onSuccess) onSuccess(validUrls);

      toast({
        title: "Upload Successful",
        description: `${validUrls.length} interior photos uploaded`,
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
        }),
      );
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload interior photos",
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
    getFileByType: (type: UploadedFile["type"]) =>
      uploadedFiles.find((f) => f.type === type),
    getFilesByType: (type: UploadedFile["type"]) =>
      uploadedFiles.filter((f) => f.type === type),
    getInteriorRoomFiles: () =>
      uploadedFiles.filter((f) =>
        [
          "interior_rooms",
          "living_room",
          "bedroom",
          "kitchen",
          "rest_room",
          "c_of_o",
          "others",
        ].includes(f.type),
      ),
  };
};
