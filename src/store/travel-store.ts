import { create } from "zustand";

export interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  travelStyle: string;
  interests: string[];
  specialRequests: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentType?: string;
  timestamp: Date;
}

interface FlightSearch {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  tripType: "one-way" | "round-trip";
  cabinClass: "economy" | "premium_economy" | "business" | "first";
}

interface TravellyStore {
  tripForm: Partial<TripFormData>;
  setTripForm: (data: Partial<TripFormData>) => void;
  resetTripForm: () => void;

  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  isPlanning: boolean;
  setIsPlanning: (v: boolean) => void;

  currentStep: "form" | "chat" | "results";
  setCurrentStep: (step: "form" | "chat" | "results") => void;

  flightSearch: Partial<FlightSearch>;
  setFlightSearch: (data: Partial<FlightSearch>) => void;

  avatarState: "idle" | "thinking" | "talking" | "excited" | "suggesting";
  setAvatarState: (
    state: "idle" | "thinking" | "talking" | "excited" | "suggesting"
  ) => void;

  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const useTravellyStore = create<TravellyStore>((set) => ({
  tripForm: {},
  setTripForm: (data) =>
    set((state) => ({ tripForm: { ...state.tripForm, ...data } })),
  resetTripForm: () => set({ tripForm: {} }),

  chatMessages: [],
  addChatMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),

  isPlanning: false,
  setIsPlanning: (v) => set({ isPlanning: v }),

  currentStep: "form",
  setCurrentStep: (step) => set({ currentStep: step }),

  flightSearch: { tripType: "round-trip", cabinClass: "economy", passengers: 1 },
  setFlightSearch: (data) =>
    set((state) => ({ flightSearch: { ...state.flightSearch, ...data } })),

  avatarState: "idle",
  setAvatarState: (avatarState) => set({ avatarState }),

  activeSection: "hero",
  setActiveSection: (section) => set({ activeSection: section }),
}));
