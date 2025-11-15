'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={theme === 'light' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setTheme('light')}
      >
        ☀️ Light
      </Button>
      <Button
        variant={theme === 'dark' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setTheme('dark')}
      >
        🌙 Dark
      </Button>
      <Button
        variant={theme === 'system' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setTheme('system')}
      >
        💻 System
      </Button>
    </div>
  );
}
