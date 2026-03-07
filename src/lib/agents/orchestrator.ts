import { streamText, generateText, type ModelMessage } from "ai";
import { AGENT_CONFIGS, type AgentType } from "./config";
import { replaceAffiliateTags } from "@/lib/affiliate";
import type { TransportMode } from "@/store/travel-store";

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
  originCity?: string;
  originAirport?: string;
  transportMode?: TransportMode;
  suggestTrip?: boolean;
}): Promise<{
  itinerary: string;
  flights: string;
  hotels: string;
  budget: string;
  localTips: string;
}> {
  const context = { ...tripDetails, currency: "INR" };

  const origin = tripDetails.originCity || "India";
  const originAirport = tripDetails.originAirport || "";
  const transport = tripDetails.transportMode || "any";
  const isSuggestMode = tripDetails.suggestTrip && !tripDetails.destination;
  const destination = tripDetails.destination || "a recommended destination in India";

  const transportLabel =
    transport === "flight" ? "by flight" :
    transport === "train" ? "by train" :
    transport === "drive" ? "by self-driving" :
    transport === "bus" ? "by bus" :
    "by the best available transport mode";

  const originContext = `Travelers are coming from ${origin}${originAirport ? ` (${originAirport})` : ""}, traveling ${transportLabel}.`;
  const suggestPrefix = isSuggestMode
    ? `The user wants trip SUGGESTIONS — they haven't picked a destination yet. Recommend 2-3 destinations from ${origin} that fit their budget of ₹${tripDetails.budget}, interests (${tripDetails.interests.join(", ")}), and travel style (${tripDetails.travelStyle}). Factor in travel cost from ${origin} ${transportLabel}. `
    : "";

  const [itinerary, flights, hotels, budget, localTips] = await Promise.all([
    runAgent(
      "trip-planner",
      `${suggestPrefix}${isSuggestMode ? "" : `Create a detailed day-by-day itinerary for ${tripDetails.travelers} travelers going to ${destination} from ${tripDetails.startDate} to ${tripDetails.endDate}. `}${originContext} Budget: ₹${tripDetails.budget}. Style: ${tripDetails.travelStyle}. Interests: ${tripDetails.interests.join(", ")}. ${tripDetails.specialRequests || ""}`,
      context
    ),
    runAgent(
      "flight-agent",
      transport === "flight" || transport === "any"
        ? `Find the best flight options from ${originAirport || origin} to ${destination} for ${tripDetails.travelers} people. Departure around ${tripDetails.startDate}, return around ${tripDetails.endDate}. Budget-conscious travelers.`
        : `The travelers prefer ${transportLabel} from ${origin} to ${destination}. Briefly mention flight alternatives if available, with prices for comparison. Departure ${tripDetails.startDate}, return ${tripDetails.endDate}, ${tripDetails.travelers} travelers.`,
      context
    ),
    runAgent(
      "hotel-agent",
      `Recommend accommodations in ${destination} for ${tripDetails.travelers} travelers, ${tripDetails.startDate} to ${tripDetails.endDate}. Budget: ₹${tripDetails.budget} total (this includes travel from ${origin}). Style: ${tripDetails.travelStyle}.`,
      context
    ),
    runAgent(
      "budget-agent",
      `Create a detailed budget breakdown for ${tripDetails.travelers} people traveling from ${origin} to ${destination}, ${tripDetails.startDate} to ${tripDetails.endDate}. ${originContext} Total budget: ₹${tripDetails.budget}. Include travel from origin (${transportLabel}), hotels, food, activities, local transport. Show the travel-from-origin cost as the first line item.`,
      context
    ),
    runAgent(
      "local-expert",
      `Share insider tips for ${destination}: best food spots, hidden gems, cultural tips, Instagram-worthy locations, and safety advice for Indian travelers coming from ${origin}.`,
      context
    ),
  ]);

  return { itinerary, flights, hotels, budget, localTips };
}
