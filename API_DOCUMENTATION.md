# FlowSync API Documentation

**Version:** 1.0.0
**Base URL:** `http://localhost:3001/api`
**Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Mood Management](#mood-management)
3. [Task Management](#task-management)
4. [Schedule Management](#schedule-management)
5. [Music Recommendations](#music-recommendations)
6. [Flow Blocks](#flow-blocks)
7. [Analytics](#analytics)
8. [AI Coach](#ai-coach)
9. [Error Responses](#error-responses)

---

## Authentication

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "timezone": "UTC"
  }
}
```

---

### Login

Authenticate an existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "timezone": "UTC"
  }
}
```

---

### Get Current User

Retrieve authenticated user's information.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "timezone": "America/New_York",
  "preferences": {}
}
```

---

### Logout

Invalidate the current session.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## Mood Management

### Analyze Mood

Analyze mood from text input using AI.

**Endpoint:** `POST /mood/analyze`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "text": "I'm feeling pretty productive today, ready to tackle my tasks!"
}
```

**Response:** `200 OK`
```json
{
  "energyLevel": "high",
  "moodCategory": "productive",
  "confidence": 0.92,
  "suggestions": [
    "Great energy! This is a perfect time for deep work.",
    "Consider tackling your most challenging tasks now."
  ]
}
```

---

### Log Mood

Manually log your current mood/energy.

**Endpoint:** `POST /mood/log`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "energyLevel": "high",
  "moodCategory": "productive",
  "context": "Just finished morning coffee"
}
```

**Response:** `201 Created`
```json
{
  "id": 123,
  "userId": 1,
  "energyLevel": "high",
  "moodCategory": "productive",
  "context": "Just finished morning coffee",
  "createdAt": "2025-11-15T10:30:00Z"
}
```

---

### Get Mood History

Retrieve mood logs for a specified period.

**Endpoint:** `GET /mood/history`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `days` (optional): Number of days to retrieve (default: 7)

**Response:** `200 OK`
```json
[
  {
    "id": 123,
    "energyLevel": "high",
    "moodCategory": "productive",
    "context": "Morning energy",
    "createdAt": "2025-11-15T10:30:00Z"
  },
  {
    "id": 122,
    "energyLevel": "neutral",
    "moodCategory": "focused",
    "context": null,
    "createdAt": "2025-11-14T14:15:00Z"
  }
]
```

---

### Get Mood Patterns

Get aggregated mood patterns and statistics.

**Endpoint:** `GET /mood/patterns`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "averageEnergy": 0.72,
  "mostCommonMood": "productive",
  "bestTimeOfDay": "09:00-11:00",
  "worstTimeOfDay": "14:00-16:00"
}
```

---

## Task Management

### Get Tasks

Retrieve all tasks for the authenticated user.

**Endpoint:** `GET /tasks`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `in_progress`, `completed`, `cancelled`)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Write project proposal",
    "description": "Draft the Q4 project proposal",
    "difficulty": "medium",
    "estimatedDuration": 120,
    "deadline": "2025-11-20T17:00:00Z",
    "status": "pending",
    "energyRequirement": "high",
    "tags": ["work", "writing"],
    "createdAt": "2025-11-15T09:00:00Z",
    "updatedAt": "2025-11-15T09:00:00Z"
  }
]
```

---

### Get Single Task

Retrieve a specific task by ID.

**Endpoint:** `GET /tasks/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Write project proposal",
  "description": "Draft the Q4 project proposal",
  "difficulty": "medium",
  "estimatedDuration": 120,
  "deadline": "2025-11-20T17:00:00Z",
  "status": "pending",
  "energyRequirement": "high",
  "tags": ["work", "writing"],
  "createdAt": "2025-11-15T09:00:00Z",
  "updatedAt": "2025-11-15T09:00:00Z"
}
```

---

### Create Task

Create a new task.

**Endpoint:** `POST /tasks`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Review code PR",
  "description": "Review the authentication module PR",
  "difficulty": "easy",
  "estimatedDuration": 30,
  "deadline": "2025-11-16T15:00:00Z",
  "energyRequirement": "neutral",
  "tags": ["code-review", "work"]
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "title": "Review code PR",
  "description": "Review the authentication module PR",
  "difficulty": "easy",
  "estimatedDuration": 30,
  "deadline": "2025-11-16T15:00:00Z",
  "status": "pending",
  "energyRequirement": "neutral",
  "tags": ["code-review", "work"],
  "createdAt": "2025-11-15T10:45:00Z",
  "updatedAt": "2025-11-15T10:45:00Z"
}
```

---

### Update Task

Update an existing task.

**Endpoint:** `PUT /tasks/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "in_progress",
  "estimatedDuration": 45
}
```

**Response:** `200 OK`
```json
{
  "id": 2,
  "title": "Review code PR",
  "status": "in_progress",
  "estimatedDuration": 45,
  "updatedAt": "2025-11-15T11:00:00Z"
}
```

---

### Delete Task

Delete a task.

**Endpoint:** `DELETE /tasks/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `204 No Content`

---

### Prioritize Tasks

Get AI-prioritized task list based on current energy level.

**Endpoint:** `POST /tasks/prioritize`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "energyLevel": "high"
}
```

**Response:** `200 OK`
```json
{
  "prioritizedTasks": [
    {
      "id": 1,
      "title": "Write project proposal",
      "priority": 1,
      "reason": "High energy matches task difficulty"
    },
    {
      "id": 3,
      "title": "Plan sprint",
      "priority": 2,
      "reason": "Critical deadline approaching"
    }
  ]
}
```

---

## Schedule Management

### Get Schedule

Retrieve scheduled tasks for a date range.

**Endpoint:** `GET /schedule`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `start` (optional): ISO 8601 date string
- `end` (optional): ISO 8601 date string

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "taskId": 1,
    "scheduledStart": "2025-11-15T09:00:00Z",
    "scheduledEnd": "2025-11-15T11:00:00Z",
    "flowBlockType": "deep-work",
    "status": "scheduled",
    "task": {
      "title": "Write project proposal"
    }
  }
]
```

---

### Generate Schedule

Generate an AI-optimized schedule based on tasks and energy patterns.

**Endpoint:** `POST /schedule/generate`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `201 Created`
```json
{
  "schedule": [
    {
      "taskId": 1,
      "scheduledStart": "2025-11-15T09:00:00Z",
      "scheduledEnd": "2025-11-15T11:00:00Z",
      "flowBlockType": "deep-work",
      "reason": "Your energy peaks at this time"
    }
  ]
}
```

---

### Update Schedule

Modify a scheduled item.

**Endpoint:** `PUT /schedule/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "scheduledStart": "2025-11-15T10:00:00Z",
  "scheduledEnd": "2025-11-15T12:00:00Z"
}
```

**Response:** `200 OK`

---

### Reshuffle Schedule

Reshuffle remaining tasks based on current energy.

**Endpoint:** `POST /schedule/reshuffle`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "energyLevel": "low"
}
```

**Response:** `200 OK`

---

## Music Recommendations

### Get Recommendations

Get Spotify playlist recommendations based on mood and energy.

**Endpoint:** `GET /music/recommendations`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `mood` (required): Current mood
- `energy` (required): Current energy level

**Response:** `200 OK`
```json
{
  "playlists": [
    {
      "id": "37i9dQZF1DX5trt9i14X7j",
      "name": "Focus Flow",
      "description": "Concentrate with ambient and post-rock music",
      "url": "https://open.spotify.com/playlist/37i9dQZF1DX5trt9i14X7j",
      "imageUrl": "https://i.scdn.co/image/..."
    }
  ]
}
```

---

### Generate Suno Prompt

Generate a music prompt for Suno AI.

**Endpoint:** `POST /music/suno-prompt`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "mood": "productive",
  "energy": "high",
  "taskType": "creative-work"
}
```

**Response:** `200 OK`
```json
{
  "prompt": "Upbeat electronic ambient music with energetic beats, perfect for creative flow state, 120 BPM, inspirational and motivating"
}
```

---

## Flow Blocks

### Get Flow Blocks

Retrieve available flow block types.

**Endpoint:** `GET /flow-blocks`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "type": "deep-work",
    "name": "Deep Work",
    "duration": 90,
    "description": "Focused, uninterrupted work session"
  },
  {
    "type": "creative-burst",
    "name": "Creative Burst",
    "duration": 45,
    "description": "High-energy creative session"
  }
]
```

---

### Create Custom Block

Create a custom flow block template.

**Endpoint:** `POST /flow-blocks/custom`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Research Sprint",
  "duration": 60,
  "description": "Dedicated research time"
}
```

**Response:** `201 Created`

---

### Get Active Block

Get currently active flow block session.

**Endpoint:** `GET /flow-blocks/active`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "type": "deep-work",
  "startTime": "2025-11-15T10:00:00Z",
  "endTime": "2025-11-15T11:30:00Z",
  "remainingTime": 3600
}
```

---

## Analytics

### Get Energy Map

Retrieve energy patterns visualization data.

**Endpoint:** `GET /analytics/energy-map`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 14)

**Response:** `200 OK`
```json
{
  "map": [
    [0.5, 0.6, 0.7, ...], // Sunday, 24 hours
    [0.4, 0.5, 0.8, ...], // Monday, 24 hours
    // ... 7 days total
  ]
}
```

---

### Get Best Times

Get optimal times for productivity based on historical data.

**Endpoint:** `GET /analytics/best-times`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "bestTimes": [
    {
      "day": "Monday",
      "hour": 9,
      "energyLevel": 0.92,
      "sampleSize": 12
    },
    {
      "day": "Tuesday",
      "hour": 10,
      "energyLevel": 0.89,
      "sampleSize": 15
    }
  ]
}
```

---

### Get Productivity Score

Calculate overall productivity score.

**Endpoint:** `GET /analytics/productivity-score`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "score": 78,
  "breakdown": {
    "taskCompletion": 85,
    "energyAlignment": 72,
    "consistency": 76
  },
  "trend": "improving"
}
```

---

## AI Coach

### Get Insights

Retrieve personalized productivity insights.

**Endpoint:** `GET /coach/insights`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "insights": [
    {
      "id": 1,
      "type": "energy-pattern",
      "message": "You consistently have high energy on Monday mornings. Schedule your most important work then.",
      "createdAt": "2025-11-15T08:00:00Z"
    },
    {
      "id": 2,
      "type": "suggestion",
      "message": "Consider taking a break around 2 PM when your energy typically dips.",
      "createdAt": "2025-11-15T08:00:00Z"
    }
  ]
}
```

---

### Get Daily Tip

Get motivational tip for today.

**Endpoint:** `GET /coach/daily-tip`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "tip": "Your energy is typically high right now. This is a great time for deep work!",
  "type": "timing"
}
```

---

### Ask Question

Ask the AI coach a question.

**Endpoint:** `POST /coach/ask`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "question": "When should I schedule my most important task?"
}
```

**Response:** `200 OK`
```json
{
  "answer": "Based on your energy patterns, you perform best between 9-11 AM on weekdays. I recommend scheduling your most important task during this window.",
  "relatedInsights": [1, 3]
}
```

---

## Error Responses

All API errors follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|------------|------------|-------------|
| 400 | VALIDATION_ERROR | Request validation failed |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

---

## Rate Limiting

- **Limit:** 100 requests per minute per user
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Webhooks (Future Feature)

FlowSync will support webhooks for real-time notifications:
- Task completion
- Energy level changes
- Schedule updates
- New insights available

---

## SDK Support (Planned)

Official SDKs coming soon:
- JavaScript/TypeScript
- Python
- Go
- Ruby

---

**For support or questions, contact:** support@flowsync.app
**API Status:** https://status.flowsync.app
