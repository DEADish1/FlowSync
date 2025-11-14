'use client';

import { useState } from 'react';
import { useFlowBlock } from '@/hooks/useFlowBlock';
import { FlowBlockCard } from '@/components/flow/FlowBlockCard';
import { ActiveTimer } from '@/components/flow/ActiveTimer';
import { Loading } from '@/components/ui/loading';
import { FlowBlock } from '@/types';

export default function FlowPage() {
  const { flowBlocks, isLoading, activeBlockType, start } = useFlowBlock();

  const handleStart = (block: FlowBlock) => {
    start(block.type, block.duration);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Flow Blocks</h1>
        <p className="mt-2 text-gray-600">
          Choose your work mode and stay in the zone.
        </p>
      </div>

      {/* Active Timer */}
      {activeBlockType && (
        <div className="max-w-md mx-auto">
          <ActiveTimer />
        </div>
      )}

      {/* Flow Block Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {activeBlockType ? 'Other Flow Blocks' : 'Available Flow Blocks'}
        </h2>

        {isLoading ? (
          <div className="py-12">
            <Loading text="Loading flow blocks..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flowBlocks?.map((block) => (
              <FlowBlockCard
                key={block.id}
                block={block}
                onStart={handleStart}
                disabled={!!activeBlockType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
