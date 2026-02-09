import * as cocoSsd from "@tensorflow-models/coco-ssd";

export type RoomType = 
  | "restroom" 
  | "kitchen" 
  | "bedroom" 
  | "living_room" 
  | "compound" 
  | "exterior_shot" 
  | "compound_road"
  | "power_system";

export interface ValidationResult {
  scene_match: boolean;
  confidence: number;
  detected_objects: string[];
  missing_objects: string[];
  user_hint: string;
}

/**
 * Mapping of internal room types to detector requirements.
 * Note: coco-ssd has limited labels, so we map some requirements to available labels 
 * or broader categories.
 */
export const validateRoomFrame = (
  predictions: cocoSsd.DetectedObject[],
  roomType: RoomType,
  brightness: number
): ValidationResult => {
  const detectedLabels = predictions.map((p) => p.class.toLowerCase());
  const maxScore = predictions.length > 0 ? Math.max(...predictions.map(p => p.score)) : 0;
  
  // Base confidence aggregation (simple average of top scores or biased by presence of key objects)
  let aggregateConfidence = maxScore;

  // Quality check first
  if (brightness < 30) {
    return {
      scene_match: false,
      confidence: 0,
      detected_objects: detectedLabels,
      missing_objects: ["Adequate Lighting"],
      user_hint: "Too dark! Find better lighting or turn on lights.",
    };
  }

  if (brightness > 230) {
    return {
      scene_match: false,
      confidence: 0,
      detected_objects: detectedLabels,
      missing_objects: ["Balanced Lighting"],
      user_hint: "Too bright! Avoid direct light or glare on the lens.",
    };
  }

  switch (roomType) {
    case "restroom": {
      // Primary: Toilet OR Sink
      const primaryObjects = ["toilet", "sink"];
      const hasPrimary = detectedLabels.some((l) => primaryObjects.includes(l));

      const missing = [];
      if (!detectedLabels.includes("toilet") && !detectedLabels.includes("sink")) {
        missing.push("Toilet/Wash hand basin");
      }

      const isValid = hasPrimary;
      return {
        scene_match: isValid,
        confidence: aggregateConfidence,
        detected_objects: detectedLabels,
        missing_objects: missing,
        user_hint: isValid
          ? "Restroom detected! Great framing."
          : "Restroom: Please center the toilet or wash hand basin in the frame.",
      };
    }

    case "kitchen": {
      // Primary: Sink OR Oven/Refrigerator/Microwave
      const appliances = ["refrigerator", "microwave", "oven", "toaster"];
      const hasSink = detectedLabels.includes("sink");
      const hasAppliance = detectedLabels.some((l) => appliances.includes(l));

      const missing = [];
      if (!hasSink && !hasAppliance) missing.push("Sink or Cooking Appliance");

      const isValid = hasSink || hasAppliance;

      return {
        scene_match: isValid,
        confidence: aggregateConfidence,
        detected_objects: detectedLabels,
        missing_objects: missing,
        user_hint: isValid
          ? "Kitchen detected! Good view of appliances/sink."
          : "Kitchen: Try to include the sink, cabinets, or a cooking appliance.",
      };
    }

    case "bedroom":
    case "living_room": {
      const residential = [
        "bed",
        "couch",
        "chair",
        "tv",
        "potted plant",
        "book",
        "vase",
        "dining table",
      ];
      const isIndoor =
        detectedLabels.some((l) => residential.includes(l)) ||
        predictions.length === 0;

      const isOutdoor = detectedLabels.some((l) =>
        ["car", "truck", "bus", "traffic light"].includes(l)
      );

      const isValid = !isOutdoor;

      return {
        scene_match: isValid,
        confidence: aggregateConfidence,
        detected_objects: detectedLabels,
        missing_objects: isOutdoor ? ["Indoor Environment"] : [],
        user_hint: isOutdoor
          ? "This looks like an outdoor area. Please capture the indoor room."
          : `${roomType === "bedroom" ? "Bedroom" : "Living Room"} ready. Focus on the layout.`,
      };
    }

    case "exterior_shot": {
      const outdoorCues = ["car", "truck", "bus", "bench", "person", "dog"];
      const indoorCues = ["bed", "couch", "toilet", "refrigerator", "microwave"];
      
      const hasOutdoor = detectedLabels.some(l => outdoorCues.includes(l));
      const hasIndoor = detectedLabels.some(l => indoorCues.includes(l));
      
      // Building cues (windows/roof are not labels, but lack of specific small objects suggests facade)
      const isFarEnough = predictions.length > 0; // If detections exist, we have context
      
      let hint = "Ready to capture. Full building exterior visible.";
      let isValid = !hasIndoor;

      if (hasIndoor) {
        hint = "Step outside and point the camera at the building exterior.";
        isValid = false;
      } else if (!isFarEnough) {
        hint = "Move farther back so the full building exterior is visible.";
        isValid = false;
      } else if (detectedLabels.includes("person") && predictions.length === 1) {
        hint = "Clear obstructions and capture the building front.";
        isValid = false;
      }

      return {
        scene_match: isValid,
        confidence: aggregateConfidence,
        detected_objects: detectedLabels,
        missing_objects: isValid ? [] : ["Full Building Façade"],
        user_hint: hint,
      };
    }

    case "compound_road": {
      const surfaceCues = ["car", "truck", "bus", "bicycle", "motorcycle"];
      const buildingCues = ["toilet", "sink", "refrigerator", "bed", "couch"]; // Indoor
      
      const hasSurfaceCue = detectedLabels.some(l => surfaceCues.includes(l));
      const hasBuildingTooMuch = predictions.length > 3 && !hasSurfaceCue;
      
      let hint = "Driveway/Road detected. Surface type identifiable.";
      let isValid = !detectedLabels.some(l => buildingCues.includes(l));

      if (detectedLabels.some(l => buildingCues.includes(l))) {
        hint = "Indoor flooring detected. Please capture the outdoor road or driveway.";
        isValid = false;
      } else if (hasBuildingTooMuch) {
        hint = "This shows the building — try capturing the access road.";
        isValid = false;
      } else if (predictions.length === 0) {
        hint = "Point the camera downward to capture the road or driveway.";
        isValid = false;
      }

      return {
        scene_match: isValid,
        confidence: aggregateConfidence,
        detected_objects: detectedLabels,
        missing_objects: isValid ? [] : ["Identifiable Road Surface"],
        user_hint: hint,
      };
    }

    case "power_system": {
      // Technical objects (proxies since COCO-SSD lacks "inverter")
      const techProxies = ["suitcase", "cell phone", "laptop", "remote", "clock"];
      const householdAppliance = ["tv", "refrigerator", "microwave", "oven"];
      
      const hasTech = detectedLabels.some(l => techProxies.includes(l));
      const hasHousehold = detectedLabels.some(l => householdAppliance.includes(l));
      
      let hint = "Power equipment detected (Inverter/Battery/Solar/Generator).";
      let isValid = hasTech && !hasHousehold;

      if (hasHousehold) {
        hint = "Only regular household appliances detected. Capture the backup equipment.";
        isValid = false;
      } else if (!hasTech) {
        hint = "Capture the inverter, batteries, solar panels, or generator.";
        isValid = false;
      }

      return {
        scene_match: isValid,
        confidence: aggregateConfidence,
        detected_objects: detectedLabels,
        missing_objects: isValid ? [] : ["Power Backup Equipment"],
        user_hint: hint,
      };
    }

    default:
      return {
        scene_match: true,
        confidence: aggregateConfidence,
        detected_objects: detectedLabels,
        missing_objects: [],
        user_hint: "Ready for capture.",
      };
  }
};
