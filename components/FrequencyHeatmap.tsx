import React from 'react';
import type { AnalysisResult } from '../types';

interface FrequencyHeatmapProps {
  analysis: AnalysisResult;
}

const getColorForFrequency = (normalizedFrequency: number): string => {
    // We'll use HSL color space for easier interpolation of lightness and saturation.
    // Hue for cyan is around 180.
    const hue = 180;
    // Interpolate saturation from 50% (less vibrant) to 100% (very vibrant)
    const saturation = 50 + normalizedFrequency * 50;
    // Interpolate lightness from 25% (dark) to 60% (bright)
    const lightness = 25 + normalizedFrequency * 35;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};


export const FrequencyHeatmap: React.FC<FrequencyHeatmapProps> = ({ analysis }) => {
  const { nodes } = analysis;

  const nodesMap = new Map(nodes.map(node => [node.id, node]));

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
      <div className="grid grid-cols-5 gap-2 w-full max-w-lg aspect-square">
        {Array.from({ length: 25 }, (_, i) => i + 1).map(num => {
          const node = nodesMap.get(num);
          const normalizedFrequency = node ? node.normalizedFrequency : 0;
          const frequency = node ? node.frequency : 0;
          const bgColor = getColorForFrequency(normalizedFrequency);

          return (
            <div
              key={num}
              title={`Número ${num}\nFrequência: ${frequency}`}
              className="w-full h-full rounded-md flex items-center justify-center text-white font-bold text-lg md:text-xl transition-transform duration-200 hover:scale-110 shadow-md"
              style={{ 
                backgroundColor: bgColor,
                border: `1px solid hsl(180, 100%, 80%, ${0.2 + normalizedFrequency * 0.8})`
              }}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
};
