import React from 'react';
import type { AnalysisResult } from '../types';

interface GameSumHistogramProps {
  analysis: AnalysisResult;
}

export const GameSumHistogram: React.FC<GameSumHistogramProps> = ({ analysis }) => {
  const { gameSumDistribution } = analysis;

  if (!gameSumDistribution || gameSumDistribution.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        Não há dados suficientes para exibir o histograma.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center p-4 md:p-6 select-none">
      <h3 className="text-lg font-bold text-slate-300 mb-4">
        Distribuição da Soma dos Jogos
      </h3>
      <div className="w-full flex-grow flex items-end justify-center gap-1 border-b-2 border-slate-600 pb-2">
        {gameSumDistribution.map(({ sumRange, count, normalizedCount }) => (
          <div
            key={sumRange}
            className="flex-1 group relative"
            style={{ height: `${Math.max(normalizedCount * 100, 1)}%` }} // Set height directly on the bar
          >
            <div
              className="w-full h-full bg-cyan-600 rounded-t-sm transition-colors duration-200 group-hover:bg-cyan-400"
            ></div>
            <div className="text-[10px] text-slate-400 mt-2 text-center absolute -bottom-6 w-full left-0">
              {sumRange}
            </div>
            {/* Tooltip */}
            <div
              className="absolute bottom-full mb-2 w-max hidden group-hover:block bg-slate-900 text-white text-xs rounded py-1 px-2 border border-slate-600 shadow-lg z-10 left-1/2 -translate-x-1/2"
            >
              <p>
                <span className="font-bold">Soma:</span> {sumRange}
              </p>
              <p>
                <span className="font-bold">Jogos:</span> {count}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};