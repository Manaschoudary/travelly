import { convertToModelMessages } from "ai";
import { routeQuery, createAgentStream } from "@/lib/agents/orchestrator";

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
  const { messages, context } = await req.json();

  const lastMessage = messages[messages.length - 1];
  const lastMessageText = extractTextFromMessage(lastMessage);

  const routingResult = await routeQuery(lastMessageText, context);

  if (routingResult.route === "direct") {
    return new Response(routingResult.response, {
      headers: { "Content-Type": "text/plain" },
    });
  }

  const modelMessages = await convertToModelMessages(messages);

  const agentType = routingResult.route;
  const result = createAgentStream(agentType, modelMessages, context);

  return result.toTextStreamResponse();
}
