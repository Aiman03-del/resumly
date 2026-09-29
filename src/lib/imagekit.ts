import ImageKit from "imagekit";
import { HttpError } from "@/lib/api-error";

// The SDK throws synchronously if a key is missing, and this module used to
// construct the client at import time. Lazy initialization keeps unrelated
// routes and builds working when ImageKit is not configured.
let cachedClient: ImageKit | null = null;

export function getImageKit(): ImageKit {
  if (cachedClient) return cachedClient;

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    console.error(
      "ImageKit is not configured: missing IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, or NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.",
    );
    throw new HttpError(503, "Image upload is temporarily unavailable.");
  }

  cachedClient = new ImageKit({ publicKey, privateKey, urlEndpoint });
  return cachedClient;
}