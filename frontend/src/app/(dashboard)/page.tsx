'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckSquare, Zap, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMood } from '@/hooks/useMood';
import { useTasks } from '@/hooks/useTasks';
import { useFlowBlock } from '@/hooks/useFlowBlock';
import { useCoach } from '@/hooks/useCoach';
import { StreakCard } from '@/components/dashboard/StreakCard';

const energyVariants: Record<string, 'success' | 'warning' | 'danger'> = {
  high: 'success',
  neutral: 'warning',
  low: 'danger',
};

export default function DashboardPage() {
  const { currentEnergy } = useMood();
  const { tasks } = useTasks();
  const { activeBlockType } = useFlowBlock();
  const { dailyTip } = useCoach();

  const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
  const inProgressTasks = tasks?.filter(t => t.status === 'in_progress') || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Your Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Your energy. Your rhythm. In sync.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Current Energy
            </CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {currentEnergy || 'Unknown'}
            </div>
            <Badge variant={currentEnergy ? energyVariants[currentEnergy] : 'default'} className="mt-2">
              {currentEnergy ? 'Tracked' : 'Check in now'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks.length} / {tasks?.length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {pendingTasks.length} pending, {inProgressTasks.length} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Flow Block
            </CardTitle>
            <Zap className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {activeBlockType ? activeBlockType.replace('-', ' ') : 'None'}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {activeBlockType ? 'In session' : 'Start a flow block'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks && tasks.length > 0
                ? Math.round((completedTasks.length / tasks.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {tasks && tasks.length > 0 ? 'Keep it up!' : 'Create tasks to track'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Streak Tracker */}
      <StreakCard currentStreak={5} longestStreak={12} totalDays={45} />

      {/* Quick Actions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>What would you like to do?</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/mood">
            <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:border-electric-blue transition-colors">
              <Activity className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Check Your Energy</div>
                <div className="text-xs text-gray-500">How are you feeling right now?</div>
              </div>
            </Button>
          </Link>

          <Link href="/dashboard/tasks">
            <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:border-electric-blue transition-colors">
              <CheckSquare className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Manage Tasks</div>
                <div className="text-xs text-gray-500">Plan what matters</div>
              </div>
            </Button>
          </Link>

          <Link href="/dashboard/flow">
            <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:border-electric-blue transition-colors">
              <Zap className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Start Flow Block</div>
                <div className="text-xs text-gray-500">Find your focus</div>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* AI Coach Insight */}
      <Card className="border-2 border-purple-aura/30 dark:border-purple-aura/50 bg-gradient-to-br from-light-glow to-purple-aura/10 dark:from-purple-aura/10 dark:to-purple-aura/20 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-aura dark:text-purple-aura">
            <Sparkles className="h-5 w-5" />
            Daily Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300">
            {dailyTip || 'Track your energy to discover your natural rhythm and work at your best.'}
          </p>
          <Link href="/dashboard/coach">
            <Button variant="ghost" className="mt-4 text-purple-aura hover:text-purple-aura/80">
              Explore insights →
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
