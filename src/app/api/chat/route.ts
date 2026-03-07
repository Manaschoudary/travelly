import { convertToModelMessages } from "ai";
import { routeQuery, createAgentStream } from "@/lib/agents/orchestrator";
import { replaceAffiliateTags } from "@/lib/affiliate";

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

/**
 * Create a TransformStream that buffers text to handle {{BOOK_*}} tags that
 * may arrive split across multiple chunks. Flushes buffered text once we're
 * sure no tag is being assembled.
 */
function createAffiliateTransformStream(): TransformStream<string, string> {
  let buffer = "";

  return new TransformStream<string, string>({
    transform(chunk, controller) {
      buffer += chunk;

      // If buffer contains a partial opening "{{" that isn't closed yet, hold it
      const lastOpenIdx = buffer.lastIndexOf("{{");
      if (lastOpenIdx !== -1 && !buffer.includes("}}", lastOpenIdx)) {
        // Flush everything before the potential tag start
        if (lastOpenIdx > 0) {
          controller.enqueue(replaceAffiliateTags(buffer.slice(0, lastOpenIdx)));
          buffer = buffer.slice(lastOpenIdx);
        }
        return;
      }

      // No partial tag — process and flush the entire buffer
      controller.enqueue(replaceAffiliateTags(buffer));
      buffer = "";
    },
    flush(controller) {
      if (buffer) {
        controller.enqueue(replaceAffiliateTags(buffer));
        buffer = "";
      }
    },
  });
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
      const processed = replaceAffiliateTags(
        routingResult.response || "I can help with that!"
      );
      return new Response(processed, {
        headers: { "Content-Type": "text/plain" },
      });
    }

    const modelMessages = await convertToModelMessages(messages);

    const agentType = routingResult.route;
    const result = createAgentStream(agentType, modelMessages, context);

    const originalResponse = result.toTextStreamResponse();
    const originalBody = originalResponse.body;

    if (!originalBody) {
      return originalResponse;
    }

    const affiliateTransform = createAffiliateTransformStream();

    const transformedStream = originalBody
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(affiliateTransform)
      .pipeThrough(new TextEncoderStream());

    return new Response(transformedStream, {
      headers: originalResponse.headers,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}
