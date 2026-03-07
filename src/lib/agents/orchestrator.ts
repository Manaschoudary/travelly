import { streamText, generateText, type ModelMessage } from "ai";
import { AGENT_CONFIGS, type AgentType } from "./config";
import { replaceAffiliateTags } from "@/lib/affiliate";

interface OrchestratorResponse {
  route: AgentType | "direct";
  refinedQuery?: string;
  response?: string;
  context?: Record<string, unknown>;
}

export async function routeQuery(
  userMessage: string,
  conversationContext?: Record<string, unknown>
): Promise<OrchestratorResponse> {
  const { model, systemPrompt } = AGENT_CONFIGS.orchestrator;

  const contextStr = conversationContext
    ? `\nCurrent context: ${JSON.stringify(conversationContext)}`
    : "";

  const result = await generateText({
    model,
    system: systemPrompt + contextStr,
    prompt: userMessage,
  });

  try {
    const parsed = JSON.parse(result.text);
    return parsed as OrchestratorResponse;
  } catch {
    return { route: "trip-planner", refinedQuery: userMessage };
  }
}

export function createAgentStream(
  agentType: AgentType,
  messages: ModelMessage[],
  tripContext?: Record<string, unknown>
) {
  const config = AGENT_CONFIGS[agentType];
  if (!config) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }

  const contextStr = tripContext
    ? `\n\nTrip Context:\n${JSON.stringify(tripContext, null, 2)}`
    : "";

  return streamText({
    model: config.model,
    system: config.systemPrompt + contextStr,
    messages,
  });
}

export async function runAgent(
  agentType: AgentType,
  prompt: string,
  context?: Record<string, unknown>
): Promise<string> {
  const config = AGENT_CONFIGS[agentType];
  if (!config) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }

  const contextStr = context
    ? `\n\nContext:\n${JSON.stringify(context, null, 2)}`
    : "";

  const result = await generateText({
    model: config.model,
    system: config.systemPrompt + contextStr,
    prompt,
  });

  return replaceAffiliateTags(result.text);
}

export async function planTrip(tripDetails: {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  travelStyle: string;
  interests: string[];
  specialRequests?: string;
}): Promise<{
  itinerary: string;
  flights: string;
  hotels: string;
  budget: string;
  localTips: string;
}> {
  const context = { ...tripDetails, currency: "INR" };

  const [itinerary, flights, hotels, budget, localTips] = await Promise.all([
    runAgent(
      "trip-planner",
      `Create a detailed day-by-day itinerary for ${tripDetails.travelers} travelers going to ${tripDetails.destination} from ${tripDetails.startDate} to ${tripDetails.endDate}. Budget: ₹${tripDetails.budget}. Style: ${tripDetails.travelStyle}. Interests: ${tripDetails.interests.join(", ")}. ${tripDetails.specialRequests || ""}`,
      context
    ),
    runAgent(
      "flight-agent",
      `Find the best flight options to ${tripDetails.destination} for ${tripDetails.travelers} people. Departure around ${tripDetails.startDate}, return around ${tripDetails.endDate}. Budget-conscious travelers from India.`,
      context
    ),
    runAgent(
      "hotel-agent",
      `Recommend accommodations in ${tripDetails.destination} for ${tripDetails.travelers} travelers, ${tripDetails.startDate} to ${tripDetails.endDate}. Budget: ₹${tripDetails.budget} total. Style: ${tripDetails.travelStyle}.`,
      context
    ),
    runAgent(
      "budget-agent",
      `Create a detailed budget breakdown for ${tripDetails.travelers} people traveling to ${tripDetails.destination}, ${tripDetails.startDate} to ${tripDetails.endDate}. Total budget: ₹${tripDetails.budget}. Include flights, hotels, food, activities, transport.`,
      context
    ),
    runAgent(
      "local-expert",
      `Share insider tips for ${tripDetails.destination}: best food spots, hidden gems, cultural tips, Instagram-worthy locations, and safety advice for Indian travelers.`,
      context
    ),
  ]);

  return { itinerary, flights, hotels, budget, localTips };
}
