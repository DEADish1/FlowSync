# FlowSync - Complete Build Guide

## 🎯 Project Overview

**FlowSync** is an adaptive life-timing AI that manages your energy, not just your time. It combines mood-aware scheduling, AI-powered task prioritization, music environment sync, and personalized productivity coaching.

---

## 📋 Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Architecture](#project-architecture)
3. [Phase 1: Foundation Setup](#phase-1-foundation-setup)
4. [Phase 2: Core Features](#phase-2-core-features)
5. [Phase 3: Advanced Features](#phase-3-advanced-features)
6. [Phase 4: Polish & Deploy](#phase-4-polish--deploy)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Testing Strategy](#testing-strategy)

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14+ (React 18+)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand or Redux Toolkit
- **Data Fetching**: React Query (TanStack Query)
- **Charts/Visualization**: Recharts or D3.js
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js or Fastify
- **Language**: TypeScript
- **API Style**: REST + WebSockets (for real-time updates)
- **Authentication**: JWT + Passport.js
- **Validation**: Zod

### Database
- **Primary DB**: PostgreSQL (structured data: users, tasks, schedules)
- **Cache**: Redis (session management, real-time data)
- **Time-Series**: PostgreSQL with TimescaleDB extension (energy tracking)

### AI/ML Integration
- **Primary AI**: OpenAI GPT-4 or Anthropic Claude API
- **Embedding**: OpenAI Embeddings (for semantic task matching)
- **Audio Generation**: Suno API integration
- **Music Recommendation**: Spotify API

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Frontend) + Railway/Render (Backend)
- **Monitoring**: Sentry (errors) + PostHog (analytics)

---

## 🏗 Project Architecture

```
FlowSync/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router (Next.js 14)
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities, API clients
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # State management
│   │   └── types/           # TypeScript types
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Node.js API server
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── ai/              # AI integration logic
│   │   └── utils/           # Helper functions
│   ├── tests/               # Backend tests
│   └── package.json
│
├── database/                 # Database files
│   ├── migrations/          # SQL migrations
│   ├── seeds/               # Seed data
│   └── schema.sql           # Database schema
│
├── docker/                   # Docker configurations
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── docs/                     # Documentation
│   ├── API.md
│   ├── FEATURES.md
│   └── DEPLOYMENT.md
│
└── BUILD_GUIDE.md           # This file
```

---

## 🚀 Phase 1: Foundation Setup

### ✅ Step 1.1: Initialize Project Structure

**Tasks:**
- [ ] Create root project directory
- [ ] Initialize Git repository
- [ ] Create `.gitignore` file
- [ ] Create frontend directory with Next.js
- [ ] Create backend directory with Express
- [ ] Set up monorepo structure (optional: use Turborepo/Nx)

**Commands:**
```bash
# Root setup
mkdir -p FlowSync/{frontend,backend,database,docker,docs}
cd FlowSync
git init

# Frontend setup
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --use-npm
npm install zustand @tanstack/react-query axios date-fns recharts framer-motion

# Backend setup
cd ../backend
npm init -y
npm install express cors dotenv jsonwebtoken bcryptjs pg redis ioredis zod
npm install -D typescript @types/node @types/express ts-node nodemon
npx tsc --init
```

### ✅ Step 1.2: Configure TypeScript

**Frontend (`frontend/tsconfig.json`):**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Backend (`backend/tsconfig.json`):**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### ✅ Step 1.3: Environment Configuration

**Root `.env.example`:**
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/flowsync
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# AI Services
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Music Services
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SUNO_API_KEY=your-suno-api-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Backend
PORT=3001
NODE_ENV=development
```

### ✅ Step 1.4: Docker Setup

**`docker/docker-compose.yml`:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: flowsync
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ../backend
      dockerfile: ../docker/Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
    depends_on:
      - postgres
      - redis
    volumes:
      - ../backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ../frontend
      dockerfile: ../docker/Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    depends_on:
      - backend
    volumes:
      - ../frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

---

## 🎯 Phase 2: Core Features

### 🔮 Feature 1: Mood-Aware Scheduling

**Components:**
1. Mood input interface (voice/text)
2. Energy level categorization (AI)
3. Task prioritization engine
4. Dynamic schedule reshuffling

**Implementation Steps:**

#### Step 2.1.1: Create Mood Input UI
**File**: `frontend/src/components/mood/MoodInput.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type EnergyLevel = 'low' | 'neutral' | 'high';

export function MoodInput() {
  const [moodText, setMoodText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeMood = async () => {
    setIsAnalyzing(true);
    // API call to analyze mood
    const response = await fetch('/api/mood/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: moodText })
    });
    const data = await response.json();
    // Update app state with energy level
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">How are you feeling?</h2>
      <Textarea
        value={moodText}
        onChange={(e) => setMoodText(e.target.value)}
        placeholder="I'm feeling a bit drained today..."
        className="min-h-24"
      />
      <Button onClick={handleAnalyzeMood} disabled={isAnalyzing}>
        {isAnalyzing ? 'Analyzing...' : 'Update Mood'}
      </Button>
    </div>
  );
}
```

#### Step 2.1.2: Create Mood Analysis AI Service
**File**: `backend/src/services/moodAnalyzer.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type EnergyLevel = 'low' | 'neutral' | 'high';
export type MoodCategory = 'stressed' | 'calm' | 'excited' | 'tired' | 'focused' | 'distracted';

export interface MoodAnalysis {
  energyLevel: EnergyLevel;
  moodCategory: MoodCategory;
  confidence: number;
  suggestions: string[];
}

export async function analyzeMood(moodText: string): Promise<MoodAnalysis> {
  const prompt = `Analyze this mood/energy statement and provide:
1. Energy level (low/neutral/high)
2. Mood category (stressed/calm/excited/tired/focused/distracted)
3. Confidence score (0-100)
4. 2-3 suggestions for optimal task scheduling

User statement: "${moodText}"

Respond in JSON format:
{
  "energyLevel": "low|neutral|high",
  "moodCategory": "stressed|calm|excited|tired|focused|distracted",
  "confidence": 85,
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

#### Step 2.1.3: Create Task Prioritization Engine
**File**: `backend/src/services/taskPrioritizer.ts`

```typescript
import { Task, EnergyLevel } from '../types';

export interface PrioritizedTask extends Task {
  priority: number;
  suggestedTime: string;
  reasoning: string;
}

export function prioritizeTasks(
  tasks: Task[],
  energyLevel: EnergyLevel,
  currentTime: Date
): PrioritizedTask[] {
  // Sort tasks based on energy level, deadline, difficulty
  return tasks.map(task => {
    let priority = 0;

    // Energy-difficulty matching
    if (energyLevel === 'high' && task.difficulty === 'hard') priority += 10;
    if (energyLevel === 'low' && task.difficulty === 'easy') priority += 10;
    if (energyLevel === 'neutral') priority += 5;

    // Deadline urgency
    const hoursUntilDeadline = task.deadline
      ? (task.deadline.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
      : Infinity;
    if (hoursUntilDeadline < 24) priority += 15;
    else if (hoursUntilDeadline < 72) priority += 10;

    return {
      ...task,
      priority,
      suggestedTime: calculateSuggestedTime(task, energyLevel, currentTime),
      reasoning: generateReasoning(task, energyLevel, hoursUntilDeadline)
    };
  }).sort((a, b) => b.priority - a.priority);
}

function calculateSuggestedTime(task: Task, energy: EnergyLevel, now: Date): string {
  // Logic to suggest optimal time slot
  if (energy === 'low' && task.difficulty === 'easy') return 'now';
  if (energy === 'low' && task.difficulty === 'hard') return 'later (after recharge)';
  if (energy === 'high') return 'now';
  return 'soon';
}

function generateReasoning(task: Task, energy: EnergyLevel, hoursUntil: number): string {
  let reason = '';
  if (hoursUntil < 24) reason += 'Urgent deadline. ';
  if (energy === 'low') reason += 'Low energy - consider easier tasks first.';
  if (energy === 'high') reason += 'High energy - great time for difficult tasks.';
  return reason;
}
```

---

### 🎧 Feature 2: Sound Environment Sync

**Components:**
1. Music mood matching
2. Spotify playlist generation
3. Suno AI prompt generation
4. Beat intensity sync

**Implementation Steps:**

#### Step 2.2.1: Spotify Integration
**File**: `backend/src/services/spotifyService.ts`

```typescript
import axios from 'axios';

export class SpotifyService {
  private accessToken: string | null = null;

  async authenticate() {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    this.accessToken = response.data.access_token;
  }

  async getPlaylistForMood(mood: string, energy: string): Promise<any> {
    if (!this.accessToken) await this.authenticate();

    // Search for playlists matching mood + energy
    const searchQuery = `${mood} ${energy} focus`;
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=playlist&limit=5`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );

    return response.data.playlists.items;
  }

  async getRecommendations(seedGenres: string[], energy: number, valence: number) {
    if (!this.accessToken) await this.authenticate();

    const response = await axios.get(
      'https://api.spotify.com/v1/recommendations',
      {
        params: {
          seed_genres: seedGenres.join(','),
          target_energy: energy,
          target_valence: valence,
          limit: 20
        },
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );

    return response.data.tracks;
  }
}
```

#### Step 2.2.2: Suno AI Integration
**File**: `backend/src/services/sunoService.ts`

```typescript
export class SunoService {
  async generateSoundscape(params: {
    mood: string;
    energy: string;
    taskType: string;
  }): Promise<string> {
    // Generate Suno prompt based on task context
    const prompt = this.buildPrompt(params);

    // In real implementation, call Suno API
    // For now, return the prompt
    return prompt;
  }

  private buildPrompt(params: { mood: string; energy: string; taskType: string }): string {
    const { mood, energy, taskType } = params;

    const templates = {
      low_energy: "ambient, slow tempo, calming, soft pads, gentle rhythm",
      neutral_energy: "lo-fi beats, steady tempo, balanced, focus music",
      high_energy: "upbeat, energetic, driving rhythm, motivational, 140 bpm"
    };

    const moodModifiers = {
      stressed: "relaxing, tension-release, peaceful",
      calm: "serene, flowing, harmonious",
      excited: "uplifting, positive, bright",
      tired: "gentle, restorative, warm",
      focused: "minimal, repetitive, steady",
      distracted: "grounding, centering, structured"
    };

    return `${templates[`${energy}_energy`]}, ${moodModifiers[mood]}, perfect for ${taskType}`;
  }
}
```

---

### 🚦 Feature 3: Custom Flow Blocks

**Components:**
1. Flow block templates
2. Customizable time blocks
3. Block scheduling engine
4. Notifications & transitions

**Implementation Steps:**

#### Step 2.3.1: Flow Block Types
**File**: `backend/src/models/flowBlock.ts`

```typescript
export type FlowBlockType =
  | 'power-focus'
  | 'creative-block'
  | 'chill-reset'
  | 'grind-mode'
  | 'recovery'
  | 'deep-work';

export interface FlowBlock {
  id: string;
  type: FlowBlockType;
  duration: number; // minutes
  name: string;
  description: string;
  settings: {
    breakReminders: boolean;
    musicType: string;
    allowInterruptions: boolean;
    intensityLevel: number; // 1-10
  };
}

export const defaultFlowBlocks: Record<FlowBlockType, FlowBlock> = {
  'power-focus': {
    id: 'power-focus',
    type: 'power-focus',
    duration: 25,
    name: 'Power Focus',
    description: 'Short, intense focus session (Pomodoro style)',
    settings: {
      breakReminders: true,
      musicType: 'upbeat-focus',
      allowInterruptions: false,
      intensityLevel: 8
    }
  },
  'creative-block': {
    id: 'creative-block',
    type: 'creative-block',
    duration: 45,
    name: 'Creative Block',
    description: 'Free-flowing creative work with ambient sounds',
    settings: {
      breakReminders: false,
      musicType: 'ambient-creative',
      allowInterruptions: true,
      intensityLevel: 5
    }
  },
  'chill-reset': {
    id: 'chill-reset',
    type: 'chill-reset',
    duration: 10,
    name: 'Chill Reset',
    description: 'Short mental break to recharge',
    settings: {
      breakReminders: true,
      musicType: 'chill-lofi',
      allowInterruptions: true,
      intensityLevel: 2
    }
  },
  'grind-mode': {
    id: 'grind-mode',
    type: 'grind-mode',
    duration: 90,
    name: 'Grind Mode',
    description: 'Extended work session for repetitive tasks',
    settings: {
      breakReminders: true,
      musicType: 'rhythmic-focus',
      allowInterruptions: false,
      intensityLevel: 7
    }
  },
  'recovery': {
    id: 'recovery',
    type: 'recovery',
    duration: 15,
    name: 'Recovery',
    description: 'Restore energy after intense work',
    settings: {
      breakReminders: false,
      musicType: 'calm-ambient',
      allowInterruptions: true,
      intensityLevel: 1
    }
  },
  'deep-work': {
    id: 'deep-work',
    type: 'deep-work',
    duration: 120,
    name: 'Deep Work',
    description: 'Uninterrupted focus for complex tasks',
    settings: {
      breakReminders: true,
      musicType: 'minimal-ambient',
      allowInterruptions: false,
      intensityLevel: 9
    }
  }
};
```

---

### 🧠 Feature 4: Daily Energy Map

**Components:**
1. Time-series energy tracking
2. Pattern recognition
3. Visual heatmap
4. Predictive insights

**Implementation Steps:**

#### Step 2.4.1: Energy Tracking Schema
**File**: `database/schema.sql`

```sql
-- Energy tracking table
CREATE TABLE energy_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  energy_level VARCHAR(10) NOT NULL CHECK (energy_level IN ('low', 'neutral', 'high')),
  mood_category VARCHAR(20),
  context TEXT,
  productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient time-based queries
CREATE INDEX idx_energy_logs_user_time ON energy_logs(user_id, timestamp DESC);

-- Energy patterns table (aggregated insights)
CREATE TABLE energy_patterns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  hour_of_day INTEGER CHECK (hour_of_day >= 0 AND hour_of_day < 24),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week < 7),
  avg_energy_level DECIMAL(3,2),
  sample_count INTEGER,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, hour_of_day, day_of_week)
);
```

#### Step 2.4.2: Energy Analytics Service
**File**: `backend/src/services/energyAnalytics.ts`

```typescript
import { Pool } from 'pg';

export class EnergyAnalyticsService {
  constructor(private db: Pool) {}

  async logEnergy(userId: number, data: {
    energyLevel: string;
    moodCategory: string;
    context: string;
  }) {
    await this.db.query(
      `INSERT INTO energy_logs (user_id, energy_level, mood_category, context)
       VALUES ($1, $2, $3, $4)`,
      [userId, data.energyLevel, data.moodCategory, data.context]
    );

    // Update patterns
    await this.updatePatterns(userId);
  }

  async getEnergyMap(userId: number, days: number = 7) {
    const result = await this.db.query(
      `SELECT
         EXTRACT(HOUR FROM timestamp) as hour,
         EXTRACT(DOW FROM timestamp) as day_of_week,
         energy_level,
         COUNT(*) as count
       FROM energy_logs
       WHERE user_id = $1
         AND timestamp >= NOW() - INTERVAL '${days} days'
       GROUP BY hour, day_of_week, energy_level
       ORDER BY day_of_week, hour`,
      [userId]
    );

    return this.formatEnergyMap(result.rows);
  }

  async predictBestTimes(userId: number) {
    const result = await this.db.query(
      `SELECT
         hour_of_day,
         day_of_week,
         avg_energy_level
       FROM energy_patterns
       WHERE user_id = $1
       ORDER BY avg_energy_level DESC
       LIMIT 10`,
      [userId]
    );

    return result.rows;
  }

  private async updatePatterns(userId: number) {
    await this.db.query(
      `INSERT INTO energy_patterns (user_id, hour_of_day, day_of_week, avg_energy_level, sample_count)
       SELECT
         user_id,
         EXTRACT(HOUR FROM timestamp)::INTEGER as hour_of_day,
         EXTRACT(DOW FROM timestamp)::INTEGER as day_of_week,
         AVG(CASE
           WHEN energy_level = 'high' THEN 1.0
           WHEN energy_level = 'neutral' THEN 0.5
           ELSE 0.0
         END) as avg_energy_level,
         COUNT(*) as sample_count
       FROM energy_logs
       WHERE user_id = $1
       GROUP BY user_id, hour_of_day, day_of_week
       ON CONFLICT (user_id, hour_of_day, day_of_week)
       DO UPDATE SET
         avg_energy_level = EXCLUDED.avg_energy_level,
         sample_count = EXCLUDED.sample_count,
         last_updated = NOW()`,
      [userId]
    );
  }

  private formatEnergyMap(rows: any[]) {
    // Format into 7x24 grid for visualization
    const map: any[][] = Array(7).fill(null).map(() => Array(24).fill(null));

    rows.forEach(row => {
      const day = parseInt(row.day_of_week);
      const hour = parseInt(row.hour);
      if (!map[day][hour]) {
        map[day][hour] = { low: 0, neutral: 0, high: 0 };
      }
      map[day][hour][row.energy_level] = parseInt(row.count);
    });

    return map;
  }
}
```

---

### ⏱️ Feature 5: AI Productivity Coach

**Components:**
1. Contextual insights
2. Pattern-based recommendations
3. Habit tracking
4. Personalized tips

**Implementation Steps:**

#### Step 2.5.1: AI Coach Service
**File**: `backend/src/services/aiCoach.ts`

```typescript
import OpenAI from 'openai';
import { EnergyAnalyticsService } from './energyAnalytics';

export class AIProductivityCoach {
  private openai: OpenAI;

  constructor(
    private energyService: EnergyAnalyticsService
  ) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateInsights(userId: number): Promise<string[]> {
    // Gather user data
    const energyMap = await this.energyService.getEnergyMap(userId, 14);
    const bestTimes = await this.energyService.predictBestTimes(userId);

    // Generate contextual advice
    const prompt = `Based on this user's energy patterns over the past 2 weeks:

Energy Map Data: ${JSON.stringify(energyMap, null, 2)}
Best Performance Times: ${JSON.stringify(bestTimes, null, 2)}

Provide 3-5 actionable, personalized productivity insights. Focus on:
1. When they naturally have peak energy
2. Patterns in their low-energy periods
3. Specific suggestions for task scheduling
4. Habits they could develop

Format as a JSON array of strings.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result.insights || [];
  }

  async getDailyRecommendation(userId: number): Promise<string> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Get typical energy for this time
    const patterns = await this.energyService.predictBestTimes(userId);

    const prompt = `It's ${hour}:00 on a ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}.

Based on this user's historical patterns: ${JSON.stringify(patterns, null, 2)}

Generate a brief, motivational recommendation for RIGHT NOW. One sentence only.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0].message.content!;
  }
}
```

---

## 📊 Database Schema

**Full Schema**: `database/schema.sql`

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_duration INTEGER, -- minutes
  deadline TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  energy_requirement VARCHAR(10) CHECK (energy_requirement IN ('low', 'neutral', 'high')),
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- Schedules table
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  flow_block_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'scheduled',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schedules_user_time ON schedules(user_id, scheduled_start);

-- Energy logs (defined earlier)
-- energy_logs table
-- energy_patterns table

-- Music preferences
CREATE TABLE music_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  flow_block_type VARCHAR(50) NOT NULL,
  spotify_playlist_id VARCHAR(255),
  preferred_genres TEXT[],
  energy_level DECIMAL(3,2), -- 0.0 to 1.0
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, flow_block_type)
);

-- Productivity insights
CREATE TABLE insights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50),
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_insights_user_time ON insights(user_id, generated_at DESC);
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Mood & Energy
- `POST /api/mood/analyze` - Analyze mood text
- `POST /api/mood/log` - Log energy level
- `GET /api/mood/history` - Get mood history
- `GET /api/mood/patterns` - Get energy patterns

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/prioritize` - Get prioritized task list

### Schedule
- `GET /api/schedule` - Get schedule
- `POST /api/schedule/generate` - Generate AI schedule
- `PUT /api/schedule/:id` - Update schedule item
- `POST /api/schedule/reshuffle` - Reshuffle based on current mood

### Music
- `GET /api/music/recommendations` - Get music for current mood
- `POST /api/music/suno-prompt` - Generate Suno prompt
- `GET /api/music/spotify-playlist/:id` - Get Spotify playlist

### Flow Blocks
- `GET /api/flow-blocks` - List available flow blocks
- `POST /api/flow-blocks/custom` - Create custom flow block
- `GET /api/flow-blocks/active` - Get currently active block

### Analytics
- `GET /api/analytics/energy-map` - Get energy heatmap
- `GET /api/analytics/best-times` - Get predicted best times
- `GET /api/analytics/productivity-score` - Get productivity metrics

### AI Coach
- `GET /api/coach/insights` - Get personalized insights
- `GET /api/coach/daily-tip` - Get daily recommendation
- `POST /api/coach/ask` - Ask coach a question

---

## 🧪 Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- API response formatting

### Integration Tests
- API endpoint flows
- Database operations
- External API integrations

### E2E Tests
- User registration → task creation → schedule generation
- Mood input → schedule reshuffle
- Music recommendation flow

**Tools:**
- Jest (unit tests)
- Supertest (API tests)
- Playwright (E2E tests)

---

## 🚀 Phase 3: Advanced Features

### Additional Features to Implement:
- [ ] Voice input for mood (Speech-to-Text)
- [ ] Mobile apps (React Native)
- [ ] Calendar integrations (Google Calendar, Outlook)
- [ ] Team/collaborative mode
- [ ] Habit streaks & gamification
- [ ] Advanced data visualizations
- [ ] Export data (CSV, PDF reports)
- [ ] Dark mode
- [ ] Multi-language support

---

## 📦 Phase 4: Polish & Deploy

### Pre-deployment Checklist:
- [ ] Security audit (OWASP top 10)
- [ ] Performance optimization
- [ ] Error handling & logging
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Environment variables validation
- [ ] Database migrations tested
- [ ] Backup strategy
- [ ] Monitoring & alerts setup
- [ ] Documentation complete
- [ ] User onboarding flow
- [ ] Terms of Service & Privacy Policy

### Deployment:
1. **Frontend**: Deploy to Vercel
2. **Backend**: Deploy to Railway/Render
3. **Database**: Managed PostgreSQL (Supabase/Railway)
4. **Redis**: Upstash or Railway
5. **Domain**: Configure custom domain
6. **SSL**: Automatic via hosting providers
7. **CI/CD**: GitHub Actions for automated deployment

---

## 🎯 Development Workflow

1. **Start with Phase 1**: Get the foundation solid
2. **Implement features incrementally**: One feature at a time
3. **Test thoroughly**: After each feature
4. **Iterate based on feedback**: Don't over-engineer early
5. **Deploy early**: Get a working MVP deployed ASAP
6. **Monitor & improve**: Use real data to guide development

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Spotify API Docs](https://developer.spotify.com/documentation/web-api)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ✅ Progress Tracking

Use the TodoWrite tool throughout development to track:
- Completed tasks
- Current work-in-progress
- Blocked items
- Next priorities

---

**Let's build FlowSync! 🚀**
