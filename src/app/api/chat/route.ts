import { convertToModelMessages } from "ai";
import { routeQuery, createAgentStream } from "@/lib/agents/orchestrator";

// Allow streaming responses up to 60 seconds (Vercel default is 10s)
export const maxDuration = 60;

function extractTextFromMessage(message: Record<string, unknown>): string {
  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.parts)) {
    return message.parts
      .filter(
        (p: { type: string; text?: string }) =>
          p.type === "text" && typeof p.text === "string"
      )
      .map((p: { text: string }) => p.text)
      .join("");
  }

  return "";
}

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("No messages provided", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const lastMessageText = extractTextFromMessage(lastMessage);

    if (!lastMessageText) {
      return new Response("Empty message", { status: 400 });
    }

    const routingResult = await routeQuery(lastMessageText, context);

    if (routingResult.route === "direct") {
      return new Response(routingResult.response || "I can help with that!", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    const modelMessages = await convertToModelMessages(messages);

    const agentType = routingResult.route;
    const result = createAgentStream(agentType, modelMessages, context);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}
