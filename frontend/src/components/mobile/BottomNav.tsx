'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Brain,
  CheckSquare,
  Sparkles,
  Menu,
} from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Mood', href: '/dashboard/mood', icon: Brain },
  { name: 'Coach', href: '/dashboard/coach', icon: Sparkles },
  { name: 'More', href: '/dashboard/settings', icon: Menu },
];

/**
 * BottomNav - Mobile bottom navigation bar
 * Only visible on mobile devices (< 768px)
 */
export function BottomNav() {
  const pathname = usePathname();

  // Don't show on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-pb">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive
                  ? 'text-electric-blue'
                  : 'text-gray-600 dark:text-gray-400 active:text-electric-blue'
              )}
            >
              <Icon className="h-6 w-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn(
                'text-xs',
                isActive ? 'font-semibold' : 'font-normal'
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
