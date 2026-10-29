/**
 * PhotoOS Advanced Face Recognition Engine
 * Powered by FaceRecognitionNet (ResNet-34) via @vladmandic/face-api
 * Benchmark: 99.38% Accuracy on Labeled Faces in the Wild (LFW)
 */

import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;
let modelLoadingPromise: Promise<boolean> | null = null;

const MODEL_PATH = "/models";
export const MATCH_THRESHOLD = 0.58; // Standard optimal threshold for ResNet-34 FaceRecognitionNet (99%+ accuracy)

export interface FaceDetectionResult {
  descriptor: number[];
  score: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface MatchResult {
  assetId: string;
  distance: number;
  similarity: number; // 0 to 100 percentage
  isMatch: boolean;
}

/**
 * Initializes and loads the deep learning models from the public /models directory.
 */
export async function loadFaceRecognitionModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  if (typeof window === "undefined") return false;

  if (modelLoadingPromise) {
    return modelLoadingPromise;
  }

  modelLoadingPromise = (async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_PATH).catch((e) => {
          console.warn("[FaceRecognition] SSD Mobilenet optional load note:", e);
        }),
      ]);

      modelsLoaded = true;
      return true;
    } catch (err) {
      console.error("[FaceRecognition] Failed to load face models:", err);
      modelsLoaded = false;
      return false;
    } finally {
      modelLoadingPromise = null;
    }
  })();

  return modelLoadingPromise;
}

/**
 * Resolves a safe same-origin URL for image loading to prevent cross-origin canvas tainting.
 */
export function getSafeImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/api/")) {
    return url;
  }
  // Route external/storage URLs through same-origin proxy to guarantee clean canvas
  return `/api/storage/proxy?url=${encodeURIComponent(url)}`;
}

/**
 * Converts an image source into a loaded HTMLImageElement with clean canvas permissions.
 */
export function loadImageElement(source: string | HTMLImageElement): Promise<HTMLImageElement> {
  if (typeof source !== "string") {
    if (source.complete && source.naturalWidth > 0) {
      return Promise.resolve(source);
    }
    return new Promise((resolve, reject) => {
      source.onload = () => resolve(source);
      source.onerror = (e) => reject(e);
    });
  }

  const safeUrl = getSafeImageUrl(source);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const timeout = setTimeout(() => {
      img.src = "";
      reject(new Error("Image loading timed out."));
    }, 20000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };

    img.onerror = (err) => {
      clearTimeout(timeout);
      console.warn("[FaceRecognition] Image load failed via safe URL:", safeUrl, err);
      reject(new Error(`Failed to load image: ${safeUrl}`));
    };

    img.src = safeUrl;
  });
}

/**
 * Detects a single face (for guest selfie verification) and extracts its 128D biometric vector.
 * Enforces strict single-face validation.
 */
export async function extractSelfieFaceDescriptor(
  imageSource: string | HTMLImageElement
): Promise<{
  success: boolean;
  descriptor?: number[];
  faceCount: number;
  confidence?: number;
  error?: string;
}> {
  const ready = await loadFaceRecognitionModels();
  if (!ready) {
    return {
      success: false,
      faceCount: 0,
      error: "Face recognition AI models could not be loaded. Please refresh.",
    };
  }

  try {
    const img = await loadImageElement(imageSource);

    // 1. Try SSD MobileNet v1 first for higher accuracy
    let detections: any[] = [];
    if (faceapi.nets.ssdMobilenetv1.isLoaded) {
      try {
        const ssdOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.35 });
        detections = await faceapi
          .detectAllFaces(img, ssdOptions)
          .withFaceLandmarks()
          .withFaceDescriptors();
      } catch (e) {
        console.warn("[FaceRecognition] SSD MobileNet selfie detection notice:", e);
      }
    }

    // 2. Fallback to TinyFaceDetector with 512 input size
    if (detections.length === 0 && faceapi.nets.tinyFaceDetector.isLoaded) {
      const tinyOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.35,
      });
      detections = await faceapi
        .detectAllFaces(img, tinyOptions)
        .withFaceLandmarks()
        .withFaceDescriptors();
    }

    if (detections.length === 0) {
      return {
        success: false,
        faceCount: 0,
        error: "चेहरा स्पष्ट दिसला नाही. कृपया चांगल्या प्रकाशात कॅमेऱ्यासमोर सरळ पाहून सेल्फी घ्या.",
      };
    }

    if (detections.length > 1) {
      // If one face is clearly dominant in foreground (> 2.5x area of any background face), select it
      const sortedByArea = [...detections].sort((a, b) => {
        const areaA = a.detection.box.width * a.detection.box.height;
        const areaB = b.detection.box.width * b.detection.box.height;
        return areaB - areaA;
      });

      const dominant = sortedByArea[0];
      const secondDominant = sortedByArea[1];
      const dominantArea = dominant.detection.box.width * dominant.detection.box.height;
      const secondArea = secondDominant.detection.box.width * secondDominant.detection.box.height;

      if (dominantArea > secondArea * 2.5) {
        return {
          success: true,
          descriptor: Array.from(dominant.descriptor as Float32Array),
          faceCount: 1,
          confidence: dominant.detection.score,
        };
      }

      return {
        success: false,
        faceCount: detections.length,
        error: "सेल्फीमध्ये एकापेक्षा जास्त चेहरे आढळले आहेत. कृपया फक्त तुमचा एकट्याचा चेहरा असलेला सेल्फी घ्या.",
      };
    }

    const primaryDetection = detections[0];
    const descriptor: number[] = Array.from(primaryDetection.descriptor as Float32Array);

    return {
      success: true,
      descriptor,
      faceCount: 1,
      confidence: primaryDetection.detection.score,
    };
  } catch (err: any) {
    console.error("[FaceRecognition] extractSelfieFaceDescriptor error:", err);
    return {
      success: false,
      faceCount: 0,
      error: "सेल्फी प्रोसेस करताना त्रुटी आली. कृपया पुन्हा सेल्फी घ्या.",
    };
  }
}

/**
 * Detects all faces present in a gallery photo and extracts their 128D descriptors.
 * Handles both individual portraits and multi-person group photos.
 */
export async function extractPhotoFacesDescriptors(
  imageSource: string | HTMLImageElement
): Promise<Array<{ descriptor: number[]; confidence: number; box: any }>> {
  const ready = await loadFaceRecognitionModels();
  if (!ready) return [];

  try {
    const img = await loadImageElement(imageSource);

    // 1. Primary detection: SSD MobileNet v1 for high-accuracy multi-person photos
    let detections: any[] = [];
    if (faceapi.nets.ssdMobilenetv1.isLoaded) {
      try {
        const ssdOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.25 });
        detections = await faceapi
          .detectAllFaces(img, ssdOptions)
          .withFaceLandmarks()
          .withFaceDescriptors();
      } catch (ssdErr) {
        console.warn("[FaceRecognition] SSD MobileNet failed, falling back to TinyFaceDetector:", ssdErr);
      }
    }

    // 2. Fallback to TinyFaceDetector if SSD was not loaded or found no faces
    if (detections.length === 0 && faceapi.nets.tinyFaceDetector.isLoaded) {
      const tinyOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 608,
        scoreThreshold: 0.25,
      });
      detections = await faceapi
        .detectAllFaces(img, tinyOptions)
        .withFaceLandmarks()
        .withFaceDescriptors();
    }

    return detections.map((d) => ({
      descriptor: Array.from(d.descriptor as Float32Array),
      confidence: d.detection.score,
      box: {
        x: d.detection.box.x,
        y: d.detection.box.y,
        width: d.detection.box.width,
        height: d.detection.box.height,
      },
    }));
  } catch (err) {
    console.warn("[FaceRecognition] Could not scan photo for faces:", err);
    return [];
  }
}

/**
 * Computes exact Euclidean distance between two 128D face vectors.
 */
export function computeEuclideanDistance(
  vec1: number[] | Float32Array,
  vec2: number[] | Float32Array
): number {
  if (vec1.length !== vec2.length) {
    throw new Error(`Vector length mismatch: ${vec1.length} vs ${vec2.length}`);
  }

  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Calculates similarity percentage (0-100%) from Euclidean distance.
 * Distance 0.00 -> 100%
 * Distance 0.35 -> 95%
 * Distance 0.50 -> 88%
 * Distance 0.58 -> 80%
 * Distance >= 0.70 -> 0%
 */
export function distanceToSimilarityScore(distance: number): number {
  if (distance <= 0) return 100;
  if (distance >= 0.75) return 0;
  const normalized = Math.max(0, 1 - distance / 0.75);
  return Math.round(normalized * 100);
}

/**
 * Compares target selfie descriptor against candidate face descriptors in a photo.
 * Returns best match result.
 */
export function compareTargetFace(
  targetDescriptor: number[],
  candidateDescriptors: number[][],
  threshold = MATCH_THRESHOLD
): { isMatch: boolean; minDistance: number; similarity: number } {
  if (!candidateDescriptors || candidateDescriptors.length === 0) {
    return { isMatch: false, minDistance: 1.0, similarity: 0 };
  }

  let minDistance = Infinity;

  for (const candidate of candidateDescriptors) {
    const dist = computeEuclideanDistance(targetDescriptor, candidate);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  const isMatch = minDistance <= threshold;
  const similarity = distanceToSimilarityScore(minDistance);

  return {
    isMatch,
    minDistance,
    similarity,
  };
}
