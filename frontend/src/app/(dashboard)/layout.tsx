'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { BottomNav } from '@/components/mobile/BottomNav';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {/* Header with Notification Bell */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex justify-end">
                <NotificationBell />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />

        {/* PWA Install Prompt */}
        <InstallPrompt />

        <KeyboardShortcutsModal />
      </div>
    </ProtectedRoute>
  );
}
