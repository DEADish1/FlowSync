'use client';

import { useEffect, useCallback } from 'react';

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Hook to display keyboard shortcuts help
export function useShortcutHelp() {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: '/',
      action: () => {}, // Will be handled by specific component
      description: 'Search or focus input',
    },
    {
      key: 'n',
      ctrl: true,
      action: () => {},
      description: 'Create new task',
    },
    {
      key: 'm',
      ctrl: true,
      action: () => {},
      description: 'Log mood',
    },
    {
      key: 'f',
      ctrl: true,
      action: () => {},
      description: 'Start flow block',
    },
    {
      key: 'k',
      ctrl: true,
      action: () => {},
      description: 'Show keyboard shortcuts',
    },
    {
      key: 'd',
      ctrl: true,
      action: () => {},
      description: 'Go to dashboard',
    },
    {
      key: 't',
      ctrl: true,
      action: () => {},
      description: 'Go to tasks',
    },
    {
      key: 'e',
      ctrl: true,
      action: () => {},
      description: 'Go to energy map',
    },
  ];

  return shortcuts;
}
