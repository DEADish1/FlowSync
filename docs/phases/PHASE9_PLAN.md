# Phase 9: Mobile Experience & Progressive Web App - Plan

**Start Date**: November 15, 2025
**Status**: Planning → In Progress
**Goal**: Transform FlowSync into a mobile-first Progressive Web App (PWA) with offline support, push notifications, and optimized mobile UX.

---

## Overview

Phase 9 makes FlowSync accessible anywhere, anytime by transforming it into a fully-featured Progressive Web App. Users can install FlowSync on their mobile devices, receive push notifications, and continue working even offline.

---

## Why PWA for FlowSync?

### User Benefits
- **Install on Home Screen**: No app store required
- **Offline Access**: Continue tracking energy and tasks without internet
- **Push Notifications**: Real alerts on mobile devices
- **Fast Loading**: Service worker caching for instant startup
- **Cross-Platform**: Works on iOS, Android, desktop
- **Auto-Updates**: Always latest version without manual updates

### Technical Benefits
- **Single Codebase**: Same code for web and mobile
- **Lower Barrier**: No app store approval process
- **Easy Distribution**: Share via URL
- **Modern APIs**: Access to device features

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  FlowSync PWA                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Manifest   │  │Service Worker│  │  Web Push    │ │
│  │   (Config)   │  │  (Offline)   │  │   (Notify)   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│  ┌─────────────────────────▼──────────────────────────┐ │
│  │         Mobile-Optimized UI Components             │ │
│  │  • Bottom Navigation  • Swipe Gestures             │ │
│  │  • Touch Targets      • Responsive Layouts         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Feature 1: PWA Manifest & Configuration

### PWA Manifest
**File**: `frontend/public/manifest.json`

```json
{
  "name": "FlowSync - Adaptive Life-Timing AI",
  "short_name": "FlowSync",
  "description": "Manage your energy, not just your time",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0E27",
  "theme_color": "#2E7CFF",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ],
  "categories": ["productivity", "lifestyle"],
  "shortcuts": [
    {
      "name": "Quick Mood Check",
      "short_name": "Mood",
      "description": "Log your current mood and energy",
      "url": "/dashboard/mood",
      "icons": [
        {
          "src": "/icons/mood-96x96.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "View Tasks",
      "short_name": "Tasks",
      "description": "See your task list",
      "url": "/dashboard/tasks",
      "icons": [
        {
          "src": "/icons/tasks-96x96.png",
          "sizes": "96x96"
        }
      ]
    }
  ]
}
```

### Meta Tags
**File**: `frontend/src/app/layout.tsx`

```tsx
<head>
  <meta name="application-name" content="FlowSync" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="FlowSync" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="theme-color" content="#2E7CFF" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
</head>
```

---

## Feature 2: Service Worker (Offline Support)

### Service Worker Strategy

**File**: `frontend/public/sw.js`

```javascript
const CACHE_NAME = 'flowsync-v1';
const RUNTIME_CACHE = 'flowsync-runtime';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/mood',
  '/dashboard/tasks',
  '/offline',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API calls: Network first, cache fallback
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets: Cache first, network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const clonedResponse = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, clonedResponse);
        });

        return response;
      });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.message || 'New notification from FlowSync',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    actions: [
      {
        action: 'open',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'FlowSync', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
```

### Service Worker Registration

**File**: `frontend/src/lib/serviceWorker.ts`

```typescript
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);

          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    });
  }
}
```

---

## Feature 3: Web Push Notifications

### Push Subscription Flow

**Frontend**: `frontend/src/lib/pushNotifications.ts`

```typescript
export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications not supported');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // Send subscription to backend
  await api.post('/notifications/subscribe', subscription);

  return subscription;
}
```

**Backend**: Implement in `notificationService.ts`
- VAPID key generation
- Push notification sending via web-push library
- Subscription management

---

## Feature 4: Mobile-Optimized Navigation

### Bottom Navigation Bar

**File**: `frontend/src/components/mobile/BottomNav.tsx`

```tsx
export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Mood', href: '/dashboard/mood', icon: Brain },
    { name: 'Coach', href: '/dashboard/coach', icon: Sparkles },
    { name: 'More', href: '/dashboard/menu', icon: Menu },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full',
              pathname === item.href
                ? 'text-electric-blue'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

### Mobile Menu

**File**: `frontend/src/components/mobile/MobileMenu.tsx`

Full-screen menu for additional navigation items.

---

## Feature 5: Responsive Improvements

### Touch-Friendly Components

**Guidelines**:
- Minimum touch target: 44x44px
- Swipe gestures for common actions
- Pull-to-refresh on lists
- Bottom sheets for modals
- Large, tappable buttons

### Responsive Layouts

**Breakpoints**:
```css
/* Mobile: < 768px */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */
```

### Mobile-First Components

- **MoodQuickLog**: Simplified mood logging with emoji selection
- **TaskSwipeCard**: Swipe to complete/delete tasks
- **MobileSchedule**: Day view optimized for small screens
- **BottomSheet**: Material Design bottom sheets for actions

---

## Feature 6: Offline Data Sync

### IndexedDB Storage

**File**: `frontend/src/lib/offlineStorage.ts`

```typescript
import Dexie from 'dexie';

class FlowSyncDB extends Dexie {
  tasks!: Dexie.Table<Task, number>;
  energyLogs!: Dexie.Table<EnergyLog, number>;
  pendingSync!: Dexie.Table<PendingSync, number>;

  constructor() {
    super('FlowSyncDB');

    this.version(1).stores({
      tasks: '++id, userId, status, deadline',
      energyLogs: '++id, userId, timestamp',
      pendingSync: '++id, type, timestamp',
    });
  }
}

export const db = new FlowSyncDB();

export async function syncOfflineData() {
  const pending = await db.pendingSync.toArray();

  for (const item of pending) {
    try {
      await api.post(item.endpoint, item.data);
      await db.pendingSync.delete(item.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

### Background Sync

Use Background Sync API to sync data when connection is restored.

---

## Feature 7: Install Prompt

### Install Banner

**File**: `frontend/src/components/pwa/InstallPrompt.tsx`

```tsx
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-primary text-white rounded-lg shadow-xl p-4 z-50">
      <div className="flex items-start gap-3">
        <Download className="h-6 w-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold">Install FlowSync</h3>
          <p className="text-sm text-white/90 mt-1">
            Get quick access and work offline
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button onClick={handleInstall} variant="secondary" className="flex-1">
          Install
        </Button>
        <Button
          onClick={() => setShowPrompt(false)}
          variant="ghost"
          className="text-white"
        >
          Not now
        </Button>
      </div>
    </div>
  );
}
```

---

## Implementation Order

### Phase 9.1: PWA Foundation (2 hours)
1. Create manifest.json
2. Generate PWA icons
3. Add meta tags to layout
4. Implement service worker
5. Add service worker registration

### Phase 9.2: Mobile Navigation (1.5 hours)
1. Build BottomNav component
2. Create MobileMenu component
3. Update responsive layouts
4. Hide sidebar on mobile
5. Add touch-friendly interactions

### Phase 9.3: Push Notifications (2 hours)
1. Generate VAPID keys
2. Implement push subscription flow
3. Update notification service with web-push
4. Test push notifications
5. Add notification preferences UI

### Phase 9.4: Offline Support (2 hours)
1. Set up IndexedDB with Dexie
2. Implement offline data storage
3. Add sync logic
4. Create offline indicator
5. Test offline scenarios

### Phase 9.5: Install & Polish (1 hour)
1. Create install prompt
2. Add offline page
3. Test on multiple devices
4. Optimize performance
5. Documentation

---

## Testing Strategy

### PWA Checklist
- ✅ Manifest validates
- ✅ Service worker registers
- ✅ Offline mode works
- ✅ Install prompt appears
- ✅ Icons render correctly
- ✅ Push notifications work
- ✅ Works on iOS Safari
- ✅ Works on Android Chrome
- ✅ Lighthouse PWA score > 90

### Mobile Testing
- Test on iPhone (Safari)
- Test on Android (Chrome)
- Test on tablet
- Test landscape/portrait
- Test touch gestures
- Test offline scenarios

---

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse PWA Score**: > 90
- **Lighthouse Performance**: > 90
- **Service Worker Load**: < 100ms
- **Offline Load**: < 500ms

---

## Success Metrics

- ✅ PWA installable on all major browsers
- ✅ Offline functionality works
- ✅ Push notifications deliver reliably
- ✅ Mobile UI intuitive and fast
- ✅ Lighthouse PWA score > 90
- ✅ Works seamlessly on mobile devices

---

**Let's build Phase 9! 📱**
