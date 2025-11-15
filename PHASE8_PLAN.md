# Phase 8: Integrations & Automation - Plan

**Start Date**: November 15, 2025
**Status**: Planning → In Progress
**Goal**: Transform FlowSync into a connected productivity hub with smart notifications, calendar sync, data portability, and automation capabilities.

---

## Overview

Phase 8 extends FlowSync beyond a standalone app by adding:
- **Smart Notifications**: Real-time alerts for tasks, flow blocks, and energy insights
- **Calendar Integration**: Two-way Google Calendar sync
- **Data Export**: Export analytics, tasks, and energy data in multiple formats
- **Webhook System**: Automate workflows with external tools
- **Integration Settings**: Centralized UI for managing all integrations

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FlowSync Core                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Notification │  │   Calendar   │  │   Webhook    │     │
│  │   Service    │  │   Sync       │  │   Manager    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         ├──────────────────┼──────────────────┤              │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼────────┐   │
│  │           Integration Controller                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
        ┌───────▼────────┐   ┌────────▼──────────┐
        │ Google Calendar │   │ Email/Push/Slack  │
        │      API        │   │   Notifications   │
        └─────────────────┘   └───────────────────┘
```

---

## Feature 1: Smart Notifications

### Backend Components

#### Notification Service
**File**: `backend/src/services/notificationService.ts`

```typescript
interface Notification {
  id: string;
  userId: number;
  type: 'task_reminder' | 'flow_block_start' | 'flow_block_end' | 'energy_check' | 'achievement_unlocked';
  title: string;
  message: string;
  actionUrl?: string;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'read' | 'dismissed';
  channels: ('browser' | 'email')[];
}

class NotificationService {
  // Schedule a notification
  async scheduleNotification(notification: Omit<Notification, 'id' | 'status'>): Promise<Notification>

  // Send immediate notification
  async sendNotification(userId: number, data: NotificationData): Promise<void>

  // Get user's notifications
  async getNotifications(userId: number, filters?: { unreadOnly?: boolean, limit?: number }): Promise<Notification[]>

  // Mark as read/dismissed
  async markAsRead(notificationId: string): Promise<void>
  async markAsDismissed(notificationId: string): Promise<void>

  // Send browser push notification
  private async sendBrowserPush(userId: number, data: NotificationData): Promise<void>

  // Send email notification
  private async sendEmail(userId: number, data: NotificationData): Promise<void>
}
```

#### Database Schema
```sql
-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'read', 'dismissed')),
  channels TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_status ON notifications(user_id, status, scheduled_for);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE status = 'pending';

-- Push subscriptions for Web Push API
CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL, -- p256dh and auth keys
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);
```

#### Notification Triggers
- **Task Reminder**: 15 min before task scheduled_start
- **Flow Block Start**: When user starts a flow block
- **Flow Block End**: 5 min before flow block ends
- **Energy Check**: Every 2 hours during work hours (9am-6pm)
- **Achievement Unlocked**: Immediate when achievement is earned

### Frontend Components

#### Notification Bell
**File**: `frontend/src/components/notifications/NotificationBell.tsx`

```typescript
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <NotificationList notifications={notifications} onMarkAsRead={markAsRead} />
      </PopoverContent>
    </Popover>
  );
}
```

#### Notification Preferences
**File**: `frontend/src/app/(dashboard)/settings/notifications/page.tsx`

---

## Feature 2: Google Calendar Integration

### Backend Components

#### Calendar Sync Service
**File**: `backend/src/services/calendarSyncService.ts`

```typescript
import { google } from 'googleapis';

class CalendarSyncService {
  private oauth2Client: OAuth2Client;

  // OAuth flow
  async getAuthUrl(userId: number): Promise<string>
  async handleCallback(code: string, userId: number): Promise<void>

  // Sync operations
  async syncToGoogleCalendar(userId: number, scheduleId: number): Promise<string> // Returns Google event ID
  async importFromGoogleCalendar(userId: number, startDate: Date, endDate: Date): Promise<Task[]>

  // Two-way sync
  async fullSync(userId: number): Promise<SyncReport>

  // Webhook handling (Google Calendar push notifications)
  async handleWebhook(channelId: string, resourceState: string): Promise<void>
}

interface SyncReport {
  imported: number;
  exported: number;
  updated: number;
  conflicts: number;
  errors: string[];
}
```

#### Database Schema
```sql
-- Calendar integrations
CREATE TABLE calendar_integrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google', 'outlook', etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  calendar_id TEXT, -- Primary calendar ID
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Mapping between FlowSync schedules and external events
CREATE TABLE calendar_sync_mappings (
  id SERIAL PRIMARY KEY,
  integration_id INTEGER REFERENCES calendar_integrations(id) ON DELETE CASCADE,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  external_event_id TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(schedule_id),
  UNIQUE(integration_id, external_event_id)
);
```

### Frontend Components

#### Calendar Connect Button
**File**: `frontend/src/components/integrations/CalendarConnect.tsx`

#### Sync Status Dashboard
**File**: `frontend/src/app/(dashboard)/settings/integrations/page.tsx`

---

## Feature 3: Data Export

### Backend Components

#### Export Service
**File**: `backend/src/services/exportService.ts`

```typescript
class ExportService {
  // Export tasks
  async exportTasks(userId: number, format: 'csv' | 'json'): Promise<Buffer>

  // Export energy logs
  async exportEnergyLogs(userId: number, format: 'csv' | 'json', startDate?: Date, endDate?: Date): Promise<Buffer>

  // Export analytics report (PDF)
  async exportAnalyticsReport(userId: number, period: 'week' | 'month' | 'year'): Promise<Buffer>

  // Export full data archive
  async exportFullArchive(userId: number): Promise<Buffer> // ZIP file
}
```

#### Export Formats

**CSV Format (Tasks)**:
```csv
ID,Title,Description,Status,Difficulty,Estimated Duration,Deadline,Created At,Completed At
1,"Write blog post","Tech article about AI","completed","medium",120,"2025-11-20 10:00:00","2025-11-14 09:00:00","2025-11-15 11:30:00"
```

**JSON Format (Energy Logs)**:
```json
{
  "user_id": 1,
  "export_date": "2025-11-15T12:00:00Z",
  "period": {
    "start": "2025-11-01T00:00:00Z",
    "end": "2025-11-15T23:59:59Z"
  },
  "logs": [
    {
      "timestamp": "2025-11-15T09:00:00Z",
      "energy_level": "high",
      "mood_category": "focused",
      "context": "Morning coffee, ready to tackle complex tasks"
    }
  ]
}
```

**PDF Analytics Report**:
- Cover page with logo and date range
- Productivity summary (charts, scores, streaks)
- Energy patterns heatmap
- Top achievements
- Task completion timeline
- Insights and recommendations

### Frontend Components

#### Export Modal
**File**: `frontend/src/components/export/ExportModal.tsx`

```typescript
export function ExportModal() {
  const [dataType, setDataType] = useState<'tasks' | 'energy' | 'analytics' | 'full'>('tasks');
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const handleExport = async () => {
    const response = await exportAPI.export(dataType, format, dateRange);
    // Download file
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowsync-${dataType}-${format}`;
    a.click();
  };

  // UI...
}
```

---

## Feature 4: Webhook System

### Backend Components

#### Webhook Manager
**File**: `backend/src/services/webhookService.ts`

```typescript
interface Webhook {
  id: string;
  userId: number;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string; // For signing payloads
  active: boolean;
  lastTriggeredAt?: Date;
  createdAt: Date;
}

type WebhookEvent =
  | 'task.created'
  | 'task.completed'
  | 'task.deleted'
  | 'schedule.created'
  | 'energy.logged'
  | 'achievement.unlocked'
  | 'flow_block.started'
  | 'flow_block.completed';

class WebhookService {
  // Manage webhooks
  async createWebhook(userId: number, data: CreateWebhookData): Promise<Webhook>
  async updateWebhook(webhookId: string, data: Partial<Webhook>): Promise<Webhook>
  async deleteWebhook(webhookId: string): Promise<void>
  async listWebhooks(userId: number): Promise<Webhook[]>

  // Trigger webhooks
  async trigger(userId: number, event: WebhookEvent, payload: any): Promise<void>

  // Validate webhook signature (for receiving webhooks)
  validateSignature(payload: string, signature: string, secret: string): boolean

  // Retry failed webhooks
  async retryFailed(): Promise<void>
}
```

#### Database Schema
```sql
-- Webhooks table
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook delivery log
CREATE TABLE webhook_deliveries (
  id SERIAL PRIMARY KEY,
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMPTZ,
  failed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id, created_at DESC);
```

#### Webhook Payload Format
```json
{
  "event": "task.completed",
  "timestamp": "2025-11-15T14:30:00Z",
  "user_id": 1,
  "data": {
    "task": {
      "id": 42,
      "title": "Complete Phase 8",
      "status": "completed",
      "completed_at": "2025-11-15T14:30:00Z"
    }
  },
  "signature": "sha256=abc123..." // HMAC signature
}
```

### Frontend Components

#### Webhook Manager UI
**File**: `frontend/src/app/(dashboard)/settings/webhooks/page.tsx`

---

## Feature 5: Integration Settings Hub

### Frontend Components

#### Integrations Dashboard
**File**: `frontend/src/app/(dashboard)/settings/integrations/page.tsx`

```typescript
export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Integrations</h1>
        <p className="mt-2 text-muted-foreground">
          Connect FlowSync with your favorite tools
        </p>
      </div>

      {/* Calendar Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            Sync your FlowSync schedule with Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarIntegrationCard />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSettings />
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks
          </CardTitle>
          <CardDescription>
            Automate workflows with custom webhooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebhookManager />
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Download your FlowSync data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportSection />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Implementation Order

### Phase 8.1: Smart Notifications ⏱️ 2-3 hours
1. Create notification database schema
2. Build NotificationService
3. Add notification routes and controller
4. Create NotificationBell component
5. Integrate into app layout
6. Add notification preferences UI

### Phase 8.2: Data Export ⏱️ 2 hours
1. Build ExportService
2. Add export routes
3. Create ExportModal component
4. Implement CSV/JSON export
5. Add to settings page

### Phase 8.3: Webhook System ⏱️ 2 hours
1. Create webhook database schema
2. Build WebhookService
3. Add webhook routes and controller
4. Create WebhookManager UI
5. Integrate webhook triggers in task/schedule controllers

### Phase 8.4: Calendar Integration ⏱️ 3 hours
1. Set up Google OAuth 2.0
2. Create CalendarSyncService
3. Build calendar integration database schema
4. Add calendar routes
5. Create CalendarConnect component
6. Build sync status UI

### Phase 8.5: Integration Hub UI ⏱️ 1 hour
1. Create integrations page
2. Consolidate all integration UIs
3. Add integration status indicators
4. Polish and test

---

## API Endpoints

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread-count` - Get unread count
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/:id/dismiss` - Dismiss notification
- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `PUT /api/notifications/preferences` - Update notification preferences

### Export
- `POST /api/export/tasks` - Export tasks (format, dateRange)
- `POST /api/export/energy` - Export energy logs
- `POST /api/export/analytics` - Export analytics report
- `POST /api/export/full` - Full data archive

### Webhooks
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Create webhook
- `PUT /api/webhooks/:id` - Update webhook
- `DELETE /api/webhooks/:id` - Delete webhook
- `POST /api/webhooks/:id/test` - Test webhook
- `GET /api/webhooks/:id/deliveries` - Get delivery log

### Calendar
- `GET /api/calendar/auth-url` - Get Google OAuth URL
- `POST /api/calendar/callback` - Handle OAuth callback
- `POST /api/calendar/sync` - Trigger sync
- `GET /api/calendar/status` - Get sync status
- `DELETE /api/calendar/disconnect` - Disconnect calendar

---

## Testing Strategy

### Unit Tests
- NotificationService methods
- ExportService format generation
- WebhookService signature validation
- CalendarSyncService sync logic

### Integration Tests
- Notification scheduling and delivery
- Calendar OAuth flow
- Webhook triggering and retry
- Export file generation

### E2E Tests
- Complete calendar sync flow
- Webhook creation and testing
- Data export download
- Notification preferences update

---

## Security Considerations

1. **OAuth Tokens**: Store encrypted, rotate on access
2. **Webhook Secrets**: Generate cryptographically secure secrets
3. **API Rate Limiting**: Prevent abuse of export/webhook endpoints
4. **CORS**: Restrict webhook callback origins
5. **Signature Validation**: Verify all webhook payloads

---

## Success Metrics

- ✅ Notifications delivered within 30 seconds
- ✅ Calendar sync accuracy >99%
- ✅ Export generation <5 seconds for typical data sets
- ✅ Webhook delivery success rate >95%
- ✅ Zero data leaks or unauthorized access

---

**Let's build Phase 8! 🚀**
