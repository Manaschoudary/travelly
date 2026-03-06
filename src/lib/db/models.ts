import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider: "credentials" | "google";
  preferences?: {
    travelStyle?: string[];
    budget?: "budget" | "mid-range" | "luxury";
    interests?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    preferences: {
      travelStyle: [String],
      budget: {
        type: String,
        enum: ["budget", "mid-range", "luxury"],
      },
      interests: [String],
    },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

// Trip / Itinerary
export interface ITrip extends Document {
  userId: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  currency: string;
  travelers: number;
  status: "planning" | "booked" | "completed" | "cancelled";
  itinerary: {
    day: number;
    date: string;
    activities: {
      time: string;
      title: string;
      description: string;
      type: "flight" | "hotel" | "activity" | "food" | "transport";
      cost?: number;
      affiliateLink?: string;
      bookingPlatform?: string;
    }[];
  }[];
  totalEstimatedCost: number;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    travelers: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["planning", "booked", "completed", "cancelled"],
      default: "planning",
    },
    itinerary: [
      {
        day: Number,
        date: String,
        activities: [
          {
            time: String,
            title: String,
            description: String,
            type: {
              type: String,
              enum: ["flight", "hotel", "activity", "food", "transport"],
            },
            cost: Number,
            affiliateLink: String,
            bookingPlatform: String,
          },
        ],
      },
    ],
    totalEstimatedCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Trip =
  mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);

// Chat History
export interface IChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  agentType?: string;
}

export interface IChatSession extends Document {
  userId: string;
  tripId?: string;
  title: string;
  messages: IChatMessage[];
  context: {
    destination?: string;
    dates?: { start: string; end: string };
    budget?: number;
    travelers?: number;
    preferences?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: String, required: true, index: true },
    tripId: { type: String },
    title: { type: String, default: "New Trip Planning" },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant", "system"] },
        content: String,
        timestamp: { type: Date, default: Date.now },
        agentType: String,
      },
    ],
    context: {
      destination: String,
      dates: {
        start: String,
        end: String,
      },
      budget: Number,
      travelers: Number,
      preferences: [String],
    },
  },
  { timestamps: true }
);

export const ChatSession =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);

// Booking Tracking (for affiliate commissions)
export interface IBookingClick extends Document {
  userId: string;
  tripId?: string;
  platform: string;
  affiliateLink: string;
  type: "flight" | "hotel" | "activity";
  details: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    provider?: string;
  };
  clickedAt: Date;
}

const BookingClickSchema = new Schema<IBookingClick>({
  userId: { type: String, required: true, index: true },
  tripId: { type: String },
  platform: { type: String, required: true },
  affiliateLink: { type: String, required: true },
  type: { type: String, enum: ["flight", "hotel", "activity"] },
  details: {
    destination: String,
    checkIn: String,
    checkOut: String,
    provider: String,
  },
  clickedAt: { type: Date, default: Date.now },
});

export const BookingClick =
  mongoose.models.BookingClick ||
  mongoose.model<IBookingClick>("BookingClick", BookingClickSchema);
