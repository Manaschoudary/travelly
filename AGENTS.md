# AGENTS.md — Travelly Codebase Guide

## Project Overview

AI-powered travel planning app for Indian travelers. Next.js 16 + React 19, TypeScript (strict mode), Tailwind CSS v4, MongoDB/Mongoose, NextAuth v5 (beta), Vercel AI SDK with Google Gemini, Zustand for client state, shadcn/ui (new-york style) with Radix primitives.

## Build / Dev / Lint Commands

```bash
npm run dev          # Start dev server (next dev)
npm run build        # Production build (next build)
npm run start        # Start production server (next start)
npm run lint         # ESLint (flat config: eslint.config.mjs)
```

No test framework is configured. No test files exist in this codebase.

## Project Structure

```
src/
  app/                    # Next.js App Router
    api/                  # API routes (route.ts files)
      auth/[...nextauth]/ # NextAuth handler
      auth/register/      # Credentials registration
      chat/               # AI chat streaming endpoint
      flights/            # Amadeus flight search
      trips/              # Trip CRUD
      agents/             # Multi-agent trip planner
    auth/                 # Auth pages (signin, signup)
    dashboard/            # Protected dashboard page
    layout.tsx            # Root layout (SessionProvider, fonts)
    page.tsx              # Landing page (server component)
    globals.css           # Tailwind v4 + CSS vars + shadcn theme
  components/
    ui/                   # shadcn/ui primitives (DO NOT edit manually)
    auth/                 # SignInForm, SignUpForm
    chat/                 # ChatInterface, MessageBubble, TripForm, TripResults
    dashboard/            # DashboardNav, DashboardStats, TripHistoryCard
    flights/              # FlightSearchForm, FlightCard, FlightResults
    layout/               # Navbar, Footer
    sections/             # Landing page sections (Hero, CTA, etc.)
    avatar/               # TravellyAvatar (Lottie animation)
  lib/
    auth.ts               # NextAuth v5 config (Google + Credentials)
    utils.ts              # cn() helper (clsx + tailwind-merge)
    db/
      mongoose.ts         # Cached MongoDB connection
      models.ts           # Mongoose schemas: User, Trip, ChatSession, BookingClick
    agents/
      config.ts           # AI agent configs (Gemini models, system prompts)
      orchestrator.ts     # Multi-agent routing, streaming, trip planning
  store/
    travel-store.ts       # Zustand store (trip form, chat, flights, UI state)
  hooks/                  # Empty — custom hooks go here
```

## Path Aliases

`@/*` maps to `./src/*` — always use `@/` imports for project files.

## Code Style

### Imports — Order Convention

1. React/Next.js built-ins (`react`, `next/*`, `next-auth/*`)
2. Third-party libraries (`framer-motion`, `lucide-react`, `ai`, `mongoose`, `zod`)
3. Internal `@/components/ui/*` (shadcn primitives)
4. Internal `@/components/*`, `@/lib/*`, `@/store/*`
5. Relative imports (`./MessageBubble`)

```typescript
// Example (ChatInterface.tsx)
import { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTravellyStore } from "@/store/travel-store";
import MessageBubble from "./MessageBubble";
```

### Components

- **Default exports** for all components: `export default function ComponentName()`
- **Function declarations**, not arrow functions for components
- **`"use client"`** directive at top of file for client components — server components have no directive
- Props typed inline for simple cases, separate `interface` for complex ones:
  ```typescript
  // Simple — inline
  export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {}
  // Complex — interface
  interface FlightSearchFormProps { onSearch: (...) => void; loading?: boolean; }
  export default function FlightSearchForm({ onSearch, loading }: FlightSearchFormProps) {}
  ```

### Naming Conventions

- **Files**: PascalCase for components (`HeroSection.tsx`, `FlightCard.tsx`), kebab-case for non-components (`travel-store.ts`, `mongoose.ts`)
- **Components**: PascalCase (`ChatInterface`, `DashboardNav`)
- **Variables/functions**: camelCase (`handleSubmit`, `scrollTo`, `isLoading`)
- **Types/Interfaces**: PascalCase with `I` prefix for Mongoose document interfaces (`IUser`, `ITrip`), no prefix for component/store types (`TripFormData`, `ChatMessage`)
- **Constants**: camelCase for objects/arrays (`navLinks`, `popularRoutes`), UPPER_SNAKE_CASE for config (`AGENT_CONFIGS`, `MONGODB_URI`)
- **Zustand store**: `useTravellyStore` (hook naming: `use` + store name)

### TypeScript

- **Strict mode** enabled in tsconfig
- Avoid `any` — use `Record<string, unknown>` for unknown object shapes
- Use `type` imports where appropriate: `import type { Metadata } from "next"`
- Non-null assertions (`!`) used for env vars: `process.env.MONGODB_URI!`
- Mongoose model pattern to avoid recompilation:
  ```typescript
  export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
  ```

### Styling

- **Tailwind CSS v4** (via `@tailwindcss/postcss`) — no tailwind.config, config lives in globals.css
- **shadcn/ui** new-york style, neutral base color, CSS variables enabled
- Use `cn()` from `@/lib/utils` for conditional classes
- Brand colors used directly as hex in Tailwind classes:
  - Primary blue: `#0F4C81`
  - Teal accent: `#2EC4B6`
  - Orange CTA: `#FF6B35` / `#FF8C61`
  - Gold: `#FFD166`
  - Dark bg: `#1A1A2E`, `#16213E`
- Glass/blur patterns: `bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl`
- Gradients for buttons: `bg-gradient-to-r from-[#FF6B35] to-[#FF8C61]`

### Error Handling

- API routes: wrap handler body in `try/catch`, return `NextResponse.json({ error: "message" }, { status: code })`
- Client forms: `useState` for error state, display in styled error banner
- Catch blocks log with `console.error("Context:", error)` then return user-friendly message
- No global error boundary or `error.tsx` files present

### API Routes

- Use Next.js App Router route handlers (`route.ts`)
- Import `NextResponse` from `next/server` for responses
- Auth check pattern: `const session = await auth(); if (!session?.user?.id) return 401`
- Always `await connectDB()` before any Mongoose operations
- Validate required fields early, return 400 with descriptive error

### Authentication (NextAuth v5 Beta)

- Config in `src/lib/auth.ts` — exports `{ handlers, signIn, signOut, auth }`
- Providers: Google OAuth + Credentials (bcryptjs)
- JWT strategy with MongoDB user lookup in callbacks
- Route handler: `src/app/api/auth/[...nextauth]/route.ts`
- Protected pages: call `auth()` server-side, `redirect("/auth/signin")` if no session

### Database (Mongoose + MongoDB)

- Connection: `src/lib/db/mongoose.ts` — cached singleton pattern using `global.mongooseCache`
- Models: `src/lib/db/models.ts` — all schemas co-located
- Schemas: User, Trip, ChatSession, BookingClick
- Always `await connectDB()` before queries
- Use `.lean()` for read queries when plain objects suffice

### AI / Agent System

- Uses Vercel AI SDK (`ai` package) with `@ai-sdk/google` (Gemini)
- Models: `gemini-2.5-flash` (main), `gemini-2.5-flash-lite` (routing/lightweight)
- Agent types: orchestrator, trip-planner, flight-agent, hotel-agent, budget-agent, local-expert
- Orchestrator routes queries to specialized agents via JSON classification
- Streaming: `streamText()` → `toTextStreamResponse()` for chat endpoint
- Batch planning: `Promise.all()` across 5 agents for parallel trip planning

### State Management (Zustand)

- Single store in `src/store/travel-store.ts`
- Pattern: `export const useTravellyStore = create<TravellyStore>((set) => ({...}))`
- Selector pattern for performance: `useTravellyStore((s) => s.avatarState)`

## Environment Variables

Required in `.env.local` (see `.env.example`):

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `NEXTAUTH_SECRET` | NextAuth session encryption |
| `NEXTAUTH_URL` | App base URL (http://localhost:3000) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini AI API key |
| `AMADEUS_CLIENT_ID` | Amadeus flight API (optional — falls back to sample data) |
| `AMADEUS_CLIENT_SECRET` | Amadeus flight API (optional) |
| `TRAVELPAYOUTS_TOKEN` | Affiliate tracking (optional) |
| `TRAVELPAYOUTS_MARKER` | Affiliate marker ID (optional) |

## Key Conventions for Agents

1. **Never edit `src/components/ui/`** — these are shadcn/ui generated. Use `npx shadcn@latest add <component>`.
2. **Server vs Client**: Page components are server by default. Add `"use client"` only when using hooks, event handlers, or browser APIs.
3. **New components**: Place in the appropriate feature folder under `src/components/`. Use PascalCase filename.
4. **New API routes**: Follow the `try/catch` + `NextResponse.json()` + `connectDB()` pattern from existing routes.
5. **Currency**: Always INR (Indian Rupees). Format with `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`.
6. **No test framework** — if adding tests, suggest Vitest + React Testing Library (matches Next.js ecosystem).
