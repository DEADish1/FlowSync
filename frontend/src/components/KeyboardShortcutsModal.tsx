'use client';

import { useState, useEffect } from 'react';
import { Modal } from './ui/modal';
import { useShortcutHelp } from '@/hooks/useKeyboardShortcuts';

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const shortcuts = useShortcutHelp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatShortcut = (shortcut: any) => {
    const keys = [];
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.shift) keys.push('Shift');
    if (shortcut.alt) keys.push('Alt');
    keys.push(shortcut.key.toUpperCase());
    return keys.join(' + ');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Keyboard Shortcuts"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Use these keyboard shortcuts to navigate FlowSync faster
        </p>

        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {shortcut.description}
              </span>
              <kbd className="px-3 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
                {formatShortcut(shortcut)}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd> to close
          </p>
        </div>
      </div>
    </Modal>
  );
}
