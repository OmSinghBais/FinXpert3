import { GoogleGenerativeAI } from "@google/generative-ai";

let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI | null {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Chatbot will not work.");
    return null;
  }

  geminiClient = new GoogleGenerativeAI(apiKey);
  return geminiClient;
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[] = [],
): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    return "I'm sorry, but the AI service is not configured. Please add GEMINI_API_KEY to your environment variables.";
  }

  try {
    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
      systemInstruction:
        "You are FinXpert, an AI assistant for financial advisors. You help advisors manage their clients, understand portfolios, execute transactions, and stay compliant. Be concise, professional, and helpful. When asked about specific data, mention that you can help interpret it but the advisor should verify details in the dashboard.",
    });

    // Build conversation context
    const history = conversationHistory
      .slice(-10) // Keep last 10 messages for context
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    const result = await model.generateContent({
      contents: [
        ...history,
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    const response = result.response.text();
    return response || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Chatbot error:", error);
    return "I encountered an error processing your request. Please try again or check your connection.";
  }
}

