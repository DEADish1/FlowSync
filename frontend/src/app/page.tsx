'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
          FlowSync
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300">
          Adaptive Life-Timing AI
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          FlowSync doesn't just manage time — it manages your energy.
          <br />
          Let AI adapt your schedule based on how you feel.
        </p>

        <div className="flex gap-4 justify-center pt-8">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-xl font-semibold mb-2">Mood-Aware Scheduling</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI adapts your schedule based on your energy levels
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🎧</div>
            <h3 className="text-xl font-semibold mb-2">Sound Environment Sync</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Music and soundscapes matched to your tasks
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">AI Productivity Coach</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Personalized insights based on your habits
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
