const SUPPORTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateReceiptFile({ imageMimeType, imageData }) {
  if (!SUPPORTED_MIME_TYPES.has(imageMimeType)) {
    throw new Error("Unsupported receipt image type");
  }
  if (!imageData || typeof imageData !== "string") {
    throw new Error("Receipt image data is required");
  }
  const maxBytes = Number(process.env.MAX_RECEIPT_BYTES ?? 5 * 1024 * 1024);
  const estimatedBytes = Buffer.byteLength(imageData, "base64");
  if (estimatedBytes > maxBytes) {
    throw new Error("Receipt image exceeds max size");
  }
}

export async function extractReceiptSuggestions(receipt) {
  if (process.env.OCR_ENABLED === "0") {
    throw new Error("OCR is disabled");
  }

  await new Promise((resolve) => setTimeout(resolve, 25));

  const hint = receipt.imageName ?? "";
  const match = hint.match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) {
    throw new Error("No amount detected");
  }

  return {
    amount: Number(match[1]),
    merchant: receipt.imageName || "Unknown merchant",
    detectedAt: new Date().toISOString()
  };
}
