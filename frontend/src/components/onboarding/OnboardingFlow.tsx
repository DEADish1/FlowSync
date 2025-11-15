'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Zap, Activity, Target } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: 'Welcome to FlowSync!',
    description: 'Manage your energy, not just your time',
    icon: Zap,
  },
  {
    id: 2,
    title: 'Track Your Energy',
    description: 'Log how you feel throughout the day',
    icon: Activity,
  },
  {
    id: 3,
    title: 'Set Your Goals',
    description: 'What do you want to accomplish?',
    icon: Target,
  },
  {
    id: 4,
    title: 'Ready to Go!',
    description: 'Start optimizing your productivity',
    icon: CheckCircle,
  },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete
      localStorage.setItem('onboarding_completed', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {steps.map((s, idx) => (
                <div
                  key={s.id}
                  className={`h-2 w-12 rounded-full transition-colors ${
                    idx <= currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Skip
            </button>
          </div>
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Icon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">{step.title}</CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            {step.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step-specific content */}
          {currentStep === 0 && (
            <div className="space-y-4 text-center">
              <p className="text-gray-700 dark:text-gray-300">
                Hi {user?.name || 'there'}! FlowSync helps you work smarter by aligning
                your tasks with your natural energy patterns.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Track Energy</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Smart Scheduling</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                  <p className="text-sm font-medium">Flow States</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-center">
                FlowSync learns when you have the most energy by tracking your mood throughout the day.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Try it out:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  "I just finished my morning coffee and feel ready to tackle anything!"
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  → AI detects: High energy, morning productivity peak
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-center">
                What's your main goal with FlowSync?
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  🎯 Complete more important work
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  ⚡ Reduce procrastination
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🧘 Better work-life balance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📈 Improve productivity
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 text-center">
              <p className="text-gray-700 dark:text-gray-300">
                You're all set! Here's what you can do next:
              </p>
              <div className="grid gap-3 mt-6">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Log your first mood</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Go to Mood → Tell us how you're feeling
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Create your first task</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Go to Tasks → Add what you need to do
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Start a flow block</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Go to Flow → Choose a focus session type
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
