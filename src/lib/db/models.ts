import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider: "credentials" | "google";
  role: "user" | "admin";
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
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
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
  originCity?: string;
  originAirport?: string;
  transportMode?: string;
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
  planContent?: {
    itinerary: string;
    flights: string;
    hotels: string;
    budget: string;
    localTips: string;
  };
  shareToken?: string;
  totalEstimatedCost: number;
  collaborators: {
    email: string;
    name?: string;
    userId?: string;
    role: "editor" | "viewer";
    status: "pending" | "accepted" | "declined";
    invitedAt: Date;
    respondedAt?: Date;
  }[];
  comments: {
    userId: string;
    userName: string;
    section: "itinerary" | "flights" | "hotels" | "budget" | "localTips" | "general";
    content: string;
    createdAt: Date;
  }[];
  votes: {
    userId: string;
    section: "itinerary" | "flights" | "hotels" | "budget" | "localTips";
    vote: "up" | "down";
  }[];
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
    originCity: { type: String },
    originAirport: { type: String },
    transportMode: { type: String },
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
    planContent: {
      itinerary: { type: String },
      flights: { type: String },
      hotels: { type: String },
      budget: { type: String },
      localTips: { type: String },
    },
    shareToken: { type: String, index: true, sparse: true },
    totalEstimatedCost: { type: Number, default: 0 },
    collaborators: [
      {
        email: { type: String, required: true },
        name: { type: String },
        userId: { type: String },
        role: { type: String, enum: ["editor", "viewer"], default: "editor" },
        status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
        invitedAt: { type: Date, default: Date.now },
        respondedAt: { type: Date },
      },
    ],
    comments: [
      {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        section: { type: String, enum: ["itinerary", "flights", "hotels", "budget", "localTips", "general"], default: "general" },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    votes: [
      {
        userId: { type: String, required: true },
        section: { type: String, enum: ["itinerary", "flights", "hotels", "budget", "localTips"], required: true },
        vote: { type: String, enum: ["up", "down"], required: true },
      },
    ],
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
    originCity?: string;
    originAirport?: string;
    transportMode?: string;
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
      originCity: String,
      originAirport: String,
      transportMode: String,
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

// ============================================================
// Admin-managed content models
// ============================================================

// Photo Gallery
export interface IPhoto extends Document {
  title: string;
  location: string;
  category: string;
  gradient: string;
  span: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema<IPhoto>(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    gradient: { type: String, required: true },
    span: { type: String, default: "col-span-1 row-span-1" },
    imageUrl: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Photo =
  mongoose.models.Photo || mongoose.model<IPhoto>("Photo", PhotoSchema);

// Group Trips (past + upcoming)
export interface IGroupTrip extends Document {
  type: "past" | "upcoming";
  title: string;
  destination: string;
  date: string;
  duration: string;
  groupSize: number | string;
  gradient: string;
  rating?: number;
  highlights?: string[];
  testimonial?: string;
  attendeeName?: string;
  price?: number;
  originalPrice?: number;
  spotsTotal?: number;
  spotsLeft?: number;
  itinerary?: { day: number; title: string; description: string }[];
  inclusions?: string[];
  exclusions?: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const GroupTripSchema = new Schema<IGroupTrip>(
  {
    type: { type: String, enum: ["past", "upcoming"], required: true },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: String, required: true },
    duration: { type: String, required: true },
    groupSize: { type: Schema.Types.Mixed, required: true },
    gradient: { type: String, required: true },
    rating: { type: Number },
    highlights: [{ type: String }],
    testimonial: { type: String },
    attendeeName: { type: String },
    price: { type: Number },
    originalPrice: { type: Number },
    spotsTotal: { type: Number },
    spotsLeft: { type: Number },
    itinerary: [
      {
        day: { type: Number },
        title: { type: String },
        description: { type: String },
      },
    ],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const GroupTrip =
  mongoose.models.GroupTrip ||
  mongoose.model<IGroupTrip>("GroupTrip", GroupTripSchema);

// Testimonials / Reviews
export interface ITestimonial extends Document {
  name: string;
  initials: string;
  destination: string;
  rating: number;
  color: string;
  review: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    initials: { type: String, required: true },
    destination: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    color: { type: String, required: true },
    review: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Testimonial =
  mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

// Destinations
export interface IDestination extends Document {
  name: string;
  tag: string;
  emoji: string;
  from: number;
  rating: number;
  gradient: string;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const DestinationSchema = new Schema<IDestination>(
  {
    name: { type: String, required: true },
    tag: { type: String, required: true },
    emoji: { type: String, required: true },
    from: { type: Number, required: true },
    rating: { type: Number, required: true },
    gradient: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Destination =
  mongoose.models.Destination ||
  mongoose.model<IDestination>("Destination", DestinationSchema);

// Group Packages
export interface IGroupPackage extends Document {
  title: string;
  emoji: string;
  tagline: string;
  groupSize: string;
  from: number;
  color: string;
  popular: boolean;
  inclusions: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const GroupPackageSchema = new Schema<IGroupPackage>(
  {
    title: { type: String, required: true },
    emoji: { type: String, required: true },
    tagline: { type: String, required: true },
    groupSize: { type: String, required: true },
    from: { type: Number, required: true },
    color: { type: String, required: true },
    popular: { type: Boolean, default: false },
    inclusions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const GroupPackage =
  mongoose.models.GroupPackage ||
  mongoose.model<IGroupPackage>("GroupPackage", GroupPackageSchema);
