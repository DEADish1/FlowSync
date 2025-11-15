'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Brain,
  CheckSquare,
  Calendar,
  Activity,
  Zap,
  Music,
  Sparkles,
  Plug2,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { FlowSyncWordmark } from '@/components/brand/FlowLoopLogo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mood Check-in', href: '/dashboard/mood', icon: Brain },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Energy Map', href: '/dashboard/energy', icon: Activity },
  { name: 'Flow Blocks', href: '/dashboard/flow', icon: Zap },
  { name: 'Music', href: '/dashboard/music', icon: Music },
  { name: 'AI Coach', href: '/dashboard/coach', icon: Sparkles },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Plug2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-midnight-black text-white w-64 border-r border-gray-800">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <Link href="/dashboard">
          <FlowSyncWordmark size="sm" className="text-white" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center px-4 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
            <span className="text-sm font-medium">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1',
            pathname === '/dashboard/settings'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          )}
        >
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
