import { imagekit } from "@/lib/imagekit";
import { NextResponse } from "next/server";

export async function GET() {
  const authParams = imagekit.getAuthenticationParameters();
  return NextResponse.json({
    ...authParams,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  });
}