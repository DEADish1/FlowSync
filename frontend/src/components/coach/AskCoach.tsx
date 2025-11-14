'use client';

import { useState } from 'react';
import { useCoach } from '@/hooks/useCoach';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export function AskCoach() {
  const [question, setQuestion] = useState('');
  const { askQuestion, isAsking, answer } = useCoach();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      await askQuestion(question);
      setQuestion('');
    } catch (error) {
      console.error('Failed to ask question:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Ask Your Coach
        </CardTitle>
        <CardDescription>
          Get personalized advice about your productivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., How can I be more productive in the mornings?"
            disabled={isAsking}
            className="min-h-24"
          />
          <Button
            type="submit"
            disabled={isAsking || !question.trim()}
            isLoading={isAsking}
            className="w-full"
          >
            {isAsking ? 'Thinking...' : 'Ask Coach'}
          </Button>
        </form>

        {answer && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Coach's Response:</p>
            <p className="text-gray-700">{answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
