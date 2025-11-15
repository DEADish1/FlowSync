# Phase 7: AI-Powered Coaching & Smart Recommendations - In Progress 🚧

**Start Date**: November 15, 2025
**Status**: Partial Implementation

---

## Overview

Phase 7 enhances FlowSync's AI capabilities with intelligent coaching, personalized recommendations, and contextual insights powered by GPT-4.

---

## Features Implemented ✅

### 1. Enhanced AI Coach Service

**File**: `backend/src/services/aiCoachService.ts`

Extended the existing `AIProductivityCoach` class with advanced coaching features:

#### Daily Briefing Generator

```typescript
async generateDailyBriefing(userId: number): Promise<DailyBriefing>
```

Generates a personalized morning/afternoon/evening briefing including:
- **Warm greeting**: Time-appropriate, personalized
- **Energy forecast**: Based on dominant energy patterns
- **Top 3 priorities**: Actionable tasks for the day
- **2-3 recommendations**: Specific advice based on stats
- **Motivational quote**: Energizing mantra

**GPT-4 Prompt Strategy**:
```
You are FlowSync, an AI productivity coach with a calm, confident voice.

User Context:
- Pending Tasks: X
- Completion Rate: Y%
- Current Streak: Z days
- Dominant Energy: [high/neutral/low]
- Current Time: HH:00

Generate brief, supportive briefing...
```

**Fallback**: Time-based generic briefing when OpenAI unavailable

#### Task Breakdown Assistant

```typescript
async breakdownTask(
  userId: number,
  taskTitle: string,
  taskDescription?: string
): Promise<TaskBreakdown>
```

Uses AI to decompose complex tasks into:
- **3-7 subtasks**: Each with title, duration (15-60min), difficulty, order
- **Strategy**: 1-2 sentence approach
- **Total time estimate**: Sum of all subtasks

**Benefits**:
- Overcomes overwhelm with large tasks
- Provides logical sequencing
- Realistic time estimates
- Difficulty-based prioritization

**Example Output**:
```json
{
  "subtasks": [
    {
      "title": "Research competitors and gather requirements",
      "estimatedDuration": 30,
      "difficulty": "easy",
      "order": 1
    },
    {
      "title": "Draft proposal outline and key points",
      "estimatedDuration": 45,
      "difficulty": "medium",
      "order": 2
    },
    {
      "title": "Write and format complete proposal",
      "estimatedDuration": 60,
      "difficulty": "hard",
      "order": 3
    },
    {
      "title": "Review, edit, and finalize document",
      "estimatedDuration": 20,
      "difficulty": "easy",
      "order": 4
    }
  ],
  "strategy": "Start with research to gather context, then outline your key arguments before writing. This builds a strong foundation and makes the writing phase more efficient.",
  "estimatedTotalTime": 155
}
```

#### Enhanced User Statistics

New `getUserStats()` private method:
- Pending tasks count (last 30 days)
- Completion rate percentage
- Current streak (last 7 days)
- Dominant energy level

---

## Technical Implementation

### AI Coach Service Architecture

```typescript
class AIProductivityCoach {
  private openai: OpenAI | null

  constructor(energyService: EnergyAnalyticsService)

  // Existing methods
  async generateInsights(userId): Promise<string[]>
  async getDailyRecommendation(userId): Promise<string>

  // NEW: Phase 7 methods
  async generateDailyBriefing(userId): Promise<DailyBriefing>
  async breakdownTask(userId, title, description): Promise<TaskBreakdown>

  // Helper
  private async getUserStats(userId)

  // Fallbacks
  private fallbackDailyBriefing(): DailyBriefing
  private fallbackTaskBreakdown(title): TaskBreakdown
}
```

### GPT-4 Integration

**Model**: `gpt-4`
**Response Format**: `json_object` for structured outputs
**Temperature**:
- 0.7 for briefings (balanced creativity/consistency)
- 0.8 for insights (more creative)

**Error Handling**:
- Try/catch wraps all OpenAI calls
- Automatic fallback to rule-based logic
- Logging for debugging

---

## Changes Summary

### Modified Files

**`backend/src/services/aiCoachService.ts`**:
- Added TypeScript interfaces: `DailyBriefing`, `TaskBreakdown`
- Imported `pool` from `../utils/db` for direct queries
- Imported `EnergyLevel`, `TaskDifficulty` types
- Added `generateDailyBriefing()` method (50 lines)
- Added `breakdownTask()` method (40 lines)
- Added `getUserStats()` private method (45 lines)
- Added `fallbackDailyBriefing()` (20 lines)
- Added `fallbackTaskBreakdown()` (25 lines)

**Total Added**: ~180 lines of production code

---

## Planned Features (Not Yet Implemented)

### Frontend Components

1. **Daily Briefing Card**
   - Display morning/afternoon/evening briefing
   - Top priorities checklist
   - Recommendations badges
   - Motivational quote

2. **Task Breakdown Modal**
   - Input: Task title + description
   - Output: Subtask list with time estimates
   - Quick-add subtasks to task list

3. **AI Coach Chat**
   - Ask questions about productivity
   - Get personalized advice
   - Context-aware responses

4. **Smart Notifications**
   - Energy-based task reminders
   - Break time suggestions
   - Streak milestone celebrations

5. **Focus Mode**
   - AI-suggested focus sessions
   - Distraction blocker integration
   - Productivity timer

### Backend Enhancements

1. **Coach Controller**
   - `GET /api/coach/briefing` - Daily briefing
   - `POST /api/coach/breakdown` - Task breakdown
   - `POST /api/coach/chat` - Chat with AI
   - `GET /api/coach/tips` - Contextual tips

2. **Pattern Detection**
   - Identify productivity patterns
   - Detect burnout signals
   - Recognize peak performance states

3. **Smart Notifications Service**
   - Generate notification timing
   - Personalize notification content
   - Respect do-not-disturb preferences

---

## Benefits

### For Users

- **Reduced Overwhelm**: Complex tasks broken into manageable steps
- **Personalized Guidance**: Briefings based on individual patterns
- **Time Management**: Realistic estimates for task completion
- **Motivation**: Encouraging messaging and actionable advice
- **Efficiency**: AI does the planning, user does the work

### For Product

- **Differentiation**: Advanced AI coaching sets FlowSync apart
- **Engagement**: Daily briefings encourage app opens
- **Retention**: Personalized experience increases stickiness
- **Value**: Practical AI that delivers real productivity gains

---

## Next Steps

1. Create CoachController with new endpoints
2. Build frontend hook: `useCoach()`
3. Create DailyBriefingCard component
4. Create TaskBreakdownModal component
5. Add coach routes to backend router
6. Test with real GPT-4 API calls
7. Add rate limiting for AI endpoints
8. Create documentation for API

---

## Success Metrics

- **Adoption**: % of users viewing daily briefing
- **Engagement**: Average briefings viewed per week
- **Utility**: % of users using task breakdown feature
- **Satisfaction**: NPS improvement after Phase 7
- **Efficiency**: Time saved through AI recommendations

---

**Phase 7 Status**: 🚧 Partial Implementation (Backend AI service enhanced)

**Next**: Complete controller, routes, and frontend components

---

**FlowSync** - Your rhythm. Your day. In sync.
