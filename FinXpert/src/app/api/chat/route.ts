import { NextResponse } from "next/server";
import { z } from "zod";
import { sendChatMessage } from "@/lib/chatbot";
import type { ChatMessage } from "@/lib/chatbot";

const ChatRequestSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = ChatRequestSchema.parse(body);

    const response = await sendChatMessage(message, conversationHistory as ChatMessage[]);

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process chat message",
      },
      { status: 500 },
    );
  }
}

