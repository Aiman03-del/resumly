import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: "https://api.x.ai/v1",
});

export async function POST(req: NextRequest) {
  const { section, content } = await req.json();

  const prompt = `You are a professional resume writer. Polish the following "${section}" section of a resume. Make it concise, impactful, and use strong action verbs. Return ONLY the improved text, no preamble.

Original:
${JSON.stringify(content)}`;

  const response = await grok.chat.completions.create({
    model: "grok-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
  });

  const polished = response.choices[0]?.message?.content ?? "";

  return NextResponse.json({ polished });
}