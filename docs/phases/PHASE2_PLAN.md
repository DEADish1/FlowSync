# Phase 2 - UI Development Plan

## Overview

Phase 2 focuses on building a complete, functional user interface for FlowSync that connects to our fully-implemented backend API.

## Goals

- ✅ Create intuitive, modern UI components
- ✅ Connect frontend to all backend endpoints
- ✅ Implement responsive design
- ✅ Add smooth animations and transitions
- ✅ Ensure accessibility
- ✅ Build a delightful user experience

## Implementation Order

### 1. Authentication Flow (High Priority)
**Why first:** Users need to login before accessing any features

Components:
- [ ] Login page with form validation
- [ ] Register page with password confirmation
- [ ] Protected route wrapper
- [ ] Auth persistence and auto-login
- [ ] Logout functionality
- [ ] Error handling for auth failures

### 2. Dashboard Layout (Foundation)
**Why second:** Provides the structure for all other components

Components:
- [ ] Sidebar navigation
- [ ] Top header with user info
- [ ] Main content area
- [ ] Mobile-responsive hamburger menu
- [ ] Quick stats overview
- [ ] Current energy indicator

### 3. Mood Input & Analysis (Core Feature #1)
**Why third:** Central to the app's value proposition

Components:
- [ ] Mood text input (multiline)
- [ ] Voice input button (future enhancement)
- [ ] Energy level display (low/neutral/high)
- [ ] Mood category badges
- [ ] AI suggestions list
- [ ] Confidence indicator
- [ ] Recent mood history

### 4. Task Management (Core Feature)
**Why fourth:** Users need tasks to schedule

Components:
- [ ] Task list with filters (status, difficulty)
- [ ] Task creation modal/form
- [ ] Task edit inline/modal
- [ ] Task deletion with confirmation
- [ ] Difficulty selector
- [ ] Deadline date picker
- [ ] Energy requirement selector
- [ ] Tags input
- [ ] Prioritized task view
- [ ] Drag-and-drop reordering (optional)

### 5. Schedule View (Core Feature)
**Why fifth:** Connects tasks with time

Components:
- [ ] Calendar/timeline view
- [ ] Day, week, month views
- [ ] Schedule items with task details
- [ ] Flow block indicators
- [ ] Drag-to-reschedule (optional)
- [ ] Generate schedule button
- [ ] Reshuffle based on mood
- [ ] Empty state for no schedule

### 6. Energy Map Visualization (Core Feature)
**Why sixth:** Data visualization of patterns

Components:
- [ ] 7x24 heatmap grid
- [ ] Color coding (red=low, yellow=neutral, green=high)
- [ ] Hover tooltips with details
- [ ] Time period selector (7/14/30 days)
- [ ] Best times highlight
- [ ] Legend
- [ ] Empty state for new users

### 7. Flow Block Selector (Core Feature)
**Why seventh:** Work mode management

Components:
- [ ] Flow block cards (6 default types)
- [ ] Active flow block timer
- [ ] Start/pause/stop controls
- [ ] Time remaining display
- [ ] Break reminders
- [ ] Custom flow block creation modal
- [ ] Flow block settings editor
- [ ] Music integration toggle

### 8. Music Recommendations
**Why eighth:** Enhances the experience

Components:
- [ ] Playlist recommendations list
- [ ] Spotify embed (if available)
- [ ] Suno prompt display
- [ ] Music preference settings
- [ ] Genre selector
- [ ] Energy/valence sliders

### 9. AI Productivity Coach
**Why ninth:** Provides insights

Components:
- [ ] Daily tip card
- [ ] Insights list
- [ ] Ask coach input
- [ ] Coach response display
- [ ] Insight dismissal
- [ ] Insight categories

### 10. Analytics Dashboard
**Why tenth:** Advanced feature

Components:
- [ ] Productivity score card
- [ ] Task completion chart
- [ ] Energy trends graph
- [ ] Weekly summary
- [ ] Best/worst times analysis

### 11. Settings & Profile
**Why last:** Lower priority for MVP

Components:
- [ ] Profile editor
- [ ] Timezone selector
- [ ] Notification preferences
- [ ] Theme toggle (dark/light)
- [ ] API key management (optional)
- [ ] Export data
- [ ] Delete account

## UI Component Library

We'll build reusable components:

### Base Components
- [ ] Button (primary, secondary, outline, ghost)
- [ ] Input (text, email, password, number)
- [ ] Textarea
- [ ] Select/Dropdown
- [ ] Checkbox
- [ ] Radio
- [ ] Toggle/Switch
- [ ] Badge
- [ ] Card
- [ ] Modal/Dialog
- [ ] Toast notifications
- [ ] Loading spinner
- [ ] Progress bar
- [ ] Tooltip
- [ ] Tabs
- [ ] Accordion

### Form Components
- [ ] FormField wrapper
- [ ] FormError display
- [ ] FormLabel
- [ ] DatePicker
- [ ] TimePicker
- [ ] TagInput
- [ ] MultiSelect

### Layout Components
- [ ] Container
- [ ] Grid
- [ ] Stack
- [ ] Divider
- [ ] Spacer

## Design System

### Color Palette
```css
Primary (Blue): #3B82F6
Secondary (Purple): #8B5CF6
Success (Green): #10B981
Warning (Yellow): #F59E0B
Error (Red): #EF4444
Gray Scale: #F9FAFB to #111827

Energy Levels:
Low: #EF4444 (Red)
Neutral: #F59E0B (Yellow)
High: #10B981 (Green)
```

### Typography
```
Font Family: Inter (already configured)
Heading 1: 2.25rem (36px) - Bold
Heading 2: 1.875rem (30px) - Bold
Heading 3: 1.5rem (24px) - Semibold
Body: 1rem (16px) - Regular
Small: 0.875rem (14px) - Regular
```

### Spacing Scale
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

### Border Radius
```
sm: 0.25rem (4px)
md: 0.5rem (8px)
lg: 1rem (16px)
full: 9999px
```

## State Management Strategy

### Zustand Stores
1. **authStore** (already exists)
   - user, token, isAuthenticated
   - setUser, setToken, logout

2. **moodStore** (already exists)
   - currentEnergy, currentMood, lastAnalysis
   - setCurrentEnergy, setCurrentMood, setLastAnalysis

3. **taskStore** (new)
   - tasks, filter, sortBy
   - addTask, updateTask, deleteTask, setFilter

4. **scheduleStore** (new)
   - schedules, currentView, selectedDate
   - addSchedule, updateSchedule, deleteSchedule

5. **flowBlockStore** (new)
   - activeBlock, timeRemaining, isRunning
   - startBlock, pauseBlock, stopBlock

6. **uiStore** (new)
   - sidebarOpen, theme, notifications
   - toggleSidebar, setTheme, addNotification

### React Query for Server State
- All API calls use React Query hooks
- Automatic caching and revalidation
- Optimistic updates for better UX
- Error handling and retry logic

## Animation Strategy

Using Framer Motion:
- Page transitions
- Modal entrance/exit
- List item animations
- Hover effects
- Loading states

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast compliance (WCAG AA)

## Responsive Breakpoints

```css
sm: 640px   (Mobile landscape)
md: 768px   (Tablet)
lg: 1024px  (Desktop)
xl: 1280px  (Large desktop)
2xl: 1536px (Extra large)
```

## File Structure

```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (dashboard home)
│   │   ├── tasks/page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── energy/page.tsx
│   │   ├── flow/page.tsx
│   │   ├── music/page.tsx
│   │   ├── coach/page.tsx
│   │   └── settings/page.tsx
│   ├── layout.tsx
│   ├── page.tsx (landing)
│   └── globals.css
├── components/
│   ├── ui/ (base components)
│   ├── auth/
│   ├── dashboard/
│   ├── mood/
│   ├── tasks/
│   ├── schedule/
│   ├── energy/
│   ├── flow/
│   ├── music/
│   └── coach/
├── hooks/
│   ├── useAuth.ts
│   ├── useMood.ts
│   ├── useTasks.ts
│   ├── useSchedule.ts
│   └── useFlowBlock.ts
├── lib/
│   ├── api.ts (already exists)
│   └── utils.ts (already exists)
├── store/
│   ├── authStore.ts (already exists)
│   ├── moodStore.ts (already exists)
│   ├── taskStore.ts
│   ├── scheduleStore.ts
│   ├── flowBlockStore.ts
│   └── uiStore.ts
└── types/
    └── index.ts (already exists)
```

## Testing Strategy (Phase 2.5)

- Component testing with React Testing Library
- Integration tests for forms
- E2E tests for critical flows (login, create task, etc.)
- Accessibility testing

## Performance Optimization

- Code splitting by route
- Image optimization
- Lazy loading for heavy components
- Memoization for expensive calculations
- Virtual scrolling for long lists

## Success Metrics

By the end of Phase 2, users should be able to:
1. ✅ Register and login
2. ✅ Input their mood and get AI analysis
3. ✅ Create and manage tasks
4. ✅ View their schedule
5. ✅ See their energy map
6. ✅ Use flow blocks
7. ✅ Get music recommendations
8. ✅ Receive AI coaching insights
9. ✅ Adjust settings

## Timeline Estimate

- Week 1: Auth + Dashboard Layout
- Week 2: Mood + Tasks
- Week 3: Schedule + Energy Map
- Week 4: Flow Blocks + Music + Coach
- Week 5: Settings + Polish + Testing

**Total: ~5 weeks for full Phase 2**

## Next Steps

Starting with:
1. Build UI component library (buttons, inputs, cards, modals)
2. Create authentication pages
3. Build dashboard layout
4. Implement mood input
5. Continue with remaining features...

---

**Let's build! 🚀**
