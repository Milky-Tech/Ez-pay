"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

interface AIContextType {
  model: cocoSsd.ObjectDetection | null;
  isModelLoading: boolean;
  error: string | null;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      if (model || isModelLoading) return;

      try {
        setIsModelLoading(true);
        console.log("Initializing TensorFlow and loading AI model...");
        await tf.ready();
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log("AI Model loaded successfully in global context");
      } catch (err) {
        console.error("Failed to load AI model in global context:", err);
        setError("Failed to initialize AI guidance");
      } finally {
        setIsModelLoading(false);
      }
    };

    loadModel();
  }, []);

  return (
    <AIContext.Provider value={{ model, isModelLoading, error }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};
