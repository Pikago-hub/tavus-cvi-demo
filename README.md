# Tavus CVI Onboarding Guide

An interactive onboarding experience built with [Tavus Conversational Video Interface (CVI)](https://www.tavus.io/). This project demonstrates how Tavus CVI can be integrated to create a personalized, conversational onboarding flow that guides users through a SaaS dashboard.

## 🎯 Project Overview

This showcases a real world use case for Tavus CVI: an **AI onboarding assistant** that welcomes new users, understands their needs, and navigates them through the application in real-time.

### Key Features

- **Conversational Onboarding**: An AI video avatar (Danny) greets users and guides them through the app based on their goals
- **Real-time Navigation**: The AI can navigate users to different sections of the app using tool calls
- **Floating Widget UI**: A minimizable chat bubble that expands to full screen for immersive conversations
- **Device Controls**: Users can toggle microphone, camera, and screen sharing during the conversation

## 💡 Why This Matters for Customers

Onboarding is where revenue is won or lost. Traditional tours (tooltips, static flows) get skipped, so users don't engage, and they churn before seeing value.

CVI changes this: an AI that **listens**, **personalizes the journey**, and **builds trust** through conversation. Users who feel understood convert to paying customers at higher rates.

## 🎬 Demo

[Watch the demo on Loom](https://www.loom.com/share/b002dd4e95e448dc8f73191a361cacbc)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                        │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard Layout                                                │
│  ├── App Sidebar (navigation)                                   │
│  ├── Site Header                                                 │
│  └── Onboarding Modal (floating CVI widget)                     │
│       ├── Conversation Component                                 │
│       │    ├── Main Video (AI avatar / screen share)            │
│       │    ├── Preview Videos (user camera)                     │
│       │    └── Device Controls                                   │
│       └── Tool Call Handler (navigation)                         │
├─────────────────────────────────────────────────────────────────┤
│  API Routes                                                      │
│  └── POST /api/conversation → Creates Tavus conversation        │
└─────────────────────────────────────────────────────────────────┘
```

### Technical Implementation

| Component           | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `OnboardingModal`   | Floating widget that manages conversation lifecycle          |
| `Conversation`      | Core CVI component handling video, audio, and tool calls     |
| `/api/conversation` | Server-side route that creates conversations via Tavus API   |
| `useCVICall`        | Custom hook for joining/leaving calls                        |
| Tool Call Handler   | Listens for navigation commands and routes users accordingly |

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Video/Audio**: Daily.co SDK via `@daily-co/daily-react`
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: Jotai
- **Icons**: Lucide React & Tabler Icons

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- Tavus API key ([get one here](https://platform.tavus.io/))
- A configured Tavus Persona with navigation tools

### Environment Variables

Create a `.env.local` file in the project root:

```bash
TAVUS_API_KEY=
TAVUS_PERSONA_ID=
```

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Production Build

```bash
bun run build
bun run start
```

## 📁 Project Structure

```
├── app/
│   ├── (dashboard)/           # Dashboard pages (analytics, projects, etc.)
│   ├── api/conversation/      # Tavus conversation API endpoint
│   └── components/cvi/        # CVI-specific components
│       ├── components/
│       │   ├── conversation/  # Main conversation UI
│       │   ├── audio-wave/    # Audio visualization
│       │   └── device-select/ # Mic, camera, screen share controls
│       └── hooks/             # CVI custom hooks
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── onboarding-modal.tsx   # Floating CVI widget
└── lib/
    └── utils.ts               # Utility functions
```

## ⚖️ Tradeoffs & Future Improvements

**Current Tradeoffs**:

- Conversation resets on page refresh (no state persistence)
- Single persona — doesn't adapt based on user role or plan tier
- No fallback for users who prefer text-based onboarding

**Future Improvements**:

- Persist conversation across navigation using session storage
- Add conversation transcript for users to reference later
- Pass user context (role, usage history) to personalize even further
- Track onboarding completion metrics to measure conversion impact

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
