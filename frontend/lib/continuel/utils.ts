import type Continuel from ".";

export interface ImageConversionOptions {
  quality?: number; // 0-1, default 0.8
  maxWidth?: number; // Optional max width for resizing
  maxHeight?: number; // Optional max height for resizing
}

export interface ConversionResult {
  success: true;
  webpBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface ConversionError {
  success: false;
  error: string;
}

export type ImageConversionResult = ConversionResult | ConversionError;

export class ContinuelUtils {
  constructor(public continuel: Continuel) {}

  /**
   * Convert an image to WebP format
   * @param input - File, Blob, or image URL to convert
   * @param options - Conversion options (quality, dimensions)
   * @returns Promise with conversion result or error
   */
  async convertToWebP(
    input: File | Blob | string,
    options: ImageConversionOptions = {}
  ): Promise<ImageConversionResult> {
    const { quality = 0.8, maxWidth, maxHeight } = options;

    try {
      // Validate quality parameter
      if (quality < 0 || quality > 1) {
        return {
          success: false,
          error: "Quality must be between 0 and 1",
        };
      }

      // Create image element
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return {
          success: false,
          error: "Canvas context not available",
        };
      }

      // Get image source and original size
      let imageUrl: string;
      let originalSize: number;

      if (input instanceof File || input instanceof Blob) {
        imageUrl = URL.createObjectURL(input);
        originalSize = input.size;
      } else {
        imageUrl = input;
        // For URL inputs, we'll estimate size after loading
        originalSize = 0;
      }

      // Load image
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.crossOrigin = "anonymous"; // Handle CORS for external URLs
        img.src = imageUrl;
      });

      // Calculate dimensions with optional resizing
      let { width, height } = img;

      if (maxWidth || maxHeight) {
        const aspectRatio = width / height;

        if (maxWidth && width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (maxHeight && height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP
      const webpBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", quality);
      });

      // Clean up object URL if we created one
      if (input instanceof File || input instanceof Blob) {
        URL.revokeObjectURL(imageUrl);
      }

      if (!webpBlob) {
        return {
          success: false,
          error: "Failed to convert image to WebP",
        };
      }

      // If original size wasn't known (URL input), estimate it
      if (originalSize === 0) {
        // Rough estimation based on canvas data
        const imageData = ctx.getImageData(0, 0, width, height);
        originalSize = imageData.data.length;
      }

      const compressedSize = webpBlob.size;
      const compressionRatio =
        originalSize > 0 ? compressedSize / originalSize : 1;

      return {
        success: true,
        webpBlob,
        originalSize,
        compressedSize,
        compressionRatio,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Convert multiple images to WebP format
   * @param inputs - Array of Files, Blobs, or image URLs
   * @param options - Conversion options applied to all images
   * @returns Promise with array of conversion results
   */
  async convertMultipleToWebP(
    inputs: (File | Blob | string)[],
    options: ImageConversionOptions = {}
  ): Promise<ImageConversionResult[]> {
    const promises = inputs.map((input) => this.convertToWebP(input, options));
    return Promise.all(promises);
  }

  /**
   * Helper method to validate if browser supports WebP
   * @returns Promise<boolean> indicating WebP support
   */
  async checkWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    });
  }

  /**
   * Create a download link for the converted WebP image
   * @param webpBlob - The WebP blob to download
   * @param filename - Optional filename (defaults to 'converted-image.webp')
   */
  downloadWebP(
    webpBlob: Blob,
    filename: string = "converted-image.webp"
  ): void {
    const url = URL.createObjectURL(webpBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".webp") ? filename : `${filename}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get optimal quality setting based on image dimensions
   * @param width - Image width
   * @param height - Image height
   * @returns Recommended quality value (0-1)
   */
  getOptimalQuality(width: number, height: number): number {
    const totalPixels = width * height;

    // Higher quality for smaller images, lower for larger ones
    if (totalPixels < 100000) return 0.9; // < 100k pixels
    if (totalPixels < 500000) return 0.8; // < 500k pixels
    if (totalPixels < 1000000) return 0.7; // < 1M pixels
    return 0.6; // >= 1M pixels
  }
}
