'use client';

import { useMemo } from 'react';

interface EnergyData {
  date: string;
  energy: number; // 0-1
}

interface EnergyTrendChartProps {
  data: EnergyData[];
  days?: number;
}

export function EnergyTrendChart({ data, days = 7 }: EnergyTrendChartProps) {
  // Process data to get last N days
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(-days);
  }, [data, days]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No energy data available</p>
      </div>
    );
  }

  const maxEnergy = Math.max(...chartData.map(d => d.energy), 1);
  const width = 800;
  const height = 300;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate points for the line
  const points = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1)) * chartWidth;
    const y = padding + chartHeight - (d.energy / maxEnergy) * chartHeight;
    return { x, y, ...d };
  });

  // Create path for the line
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Create path for the gradient fill
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ maxHeight: '400px' }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(value => {
          const y = padding + chartHeight - (value / maxEnergy) * chartHeight;
          return (
            <g key={value}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="stroke-gray-200 dark:stroke-gray-700"
                strokeDasharray="4"
              />
              <text
                x={padding - 10}
                y={y + 5}
                textAnchor="end"
                className="fill-gray-600 dark:fill-gray-400 text-xs"
              >
                {Math.round(value * 100)}%
              </text>
            </g>
          );
        })}

        {/* Area gradient fill */}
        <defs>
          <linearGradient id="energyGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#energyGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              className="hover:r-6 transition-all cursor-pointer"
            />
            {/* Date labels */}
            {i % Math.max(1, Math.floor(chartData.length / 7)) === 0 && (
              <text
                x={point.x}
                y={height - padding + 25}
                textAnchor="middle"
                className="fill-gray-600 dark:fill-gray-400 text-xs"
              >
                {new Date(point.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </text>
            )}
          </g>
        ))}

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="currentColor"
          strokeWidth="2"
          className="stroke-gray-300 dark:stroke-gray-600"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="currentColor"
          strokeWidth="2"
          className="stroke-gray-300 dark:stroke-gray-600"
        />

        {/* Labels */}
        <text
          x={padding}
          y={padding - 10}
          className="fill-gray-700 dark:fill-gray-300 text-sm font-medium"
        >
          Energy Level
        </text>
      </svg>
    </div>
  );
}
