import { getImageKit } from "@/lib/imagekit";
import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const authParams = getImageKit().getAuthenticationParameters();
    return NextResponse.json({
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error: unknown) {
    return apiErrorResponse(error, "api/imagekit-auth", "Image upload is temporarily unavailable.");
  }
}