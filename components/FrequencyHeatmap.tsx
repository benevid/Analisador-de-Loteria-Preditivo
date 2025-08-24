import React, { useRef, useEffect, useState } from 'react';
import type { AnalysisResult } from '../types';

interface FrequencyHeatmapProps {
  analysis: AnalysisResult;
}

const getColorForFrequency = (normalizedFrequency: number): string => {
    const hue = 180; // Cyan
    const saturation = 50 + normalizedFrequency * 50;
    const lightness = 25 + normalizedFrequency * 35;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const FrequencyHeatmap: React.FC<FrequencyHeatmapProps> = ({ analysis }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 400, height: 400 });
  const { nodes } = analysis;

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Usar o menor valor entre width e height para manter aspecto quadrado
        const size = Math.min(width - 40, height - 40, 600); // Máximo 600px
        setContainerSize({ width: size, height: size });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, []);

  const nodesMap = new Map(nodes.map(node => [node.id, node]));
  
  // Calcular estatísticas para exibição
  const maxFrequency = Math.max(...nodes.map(n => n.frequency));
  const minFrequency = Math.min(...nodes.map(n => n.frequency));
  const avgFrequency = nodes.reduce((sum, n) => sum + n.frequency, 0) / nodes.length;

  return (
    <div ref={containerRef} className="heatmap-container w-full h-full flex flex-col items-center justify-center p-4">
      {/* Header com estatísticas */}
      <div className="mb-4 text-center">
        <h3 className="text-lg font-bold text-white mb-2">Mapa de Calor das Frequências</h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
          <span>Máx: <strong className="text-cyan-400">{maxFrequency}</strong></span>
          <span>Mín: <strong className="text-red-400">{minFrequency}</strong></span>
          <span>Média: <strong className="text-white">{avgFrequency.toFixed(1)}</strong></span>
        </div>
      </div>

      {/* Grid do heatmap */}
      <div 
        className="grid grid-cols-5 gap-1 sm:gap-2 bg-slate-900/50 p-3 sm:p-4 rounded-lg border border-slate-700/50"
        style={{ 
          width: containerSize.width, 
          height: containerSize.width, // Manter quadrado
          gridTemplateRows: 'repeat(5, 1fr)'
        }}
      >
        {Array.from({ length: 25 }, (_, i) => i + 1).map(num => {
          const node = nodesMap.get(num);
          const frequency = node?.frequency || 0;
          const normalizedFreq = node?.normalizedFrequency || 0;
          const bgColor = getColorForFrequency(normalizedFreq);
          
          return (
            <div
              key={num}
              className="relative flex flex-col items-center justify-center rounded-lg border-2 border-white/20 
                         transition-all duration-300 hover:scale-105 hover:border-white/50 hover:shadow-lg cursor-pointer group"
              style={{ 
                backgroundColor: bgColor,
                boxShadow: `0 0 ${10 + normalizedFreq * 20}px ${bgColor}40`
              }}
            >
              {/* Número */}
              <div className="font-bold text-white text-lg sm:text-xl drop-shadow-lg">
                {num}
              </div>
              
              {/* Frequência */}
              <div className="text-xs sm:text-sm text-white/90 font-medium">
                {frequency}x
              </div>
              
              {/* Tooltip no hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap
                            border border-slate-600 shadow-lg z-10">
                <div>Número: <strong>{num}</strong></div>
                <div>Frequência: <strong>{frequency}</strong></div>
                <div>Percentual: <strong>{((frequency / analysis.totalGames) * 100).toFixed(1)}%</strong></div>
                {/* Seta do tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                              border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 w-full max-w-md">
        <div className="text-center text-sm text-slate-400 mb-2">Intensidade da Frequência</div>
        <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          {/* Gradiente visual */}
          <div 
            className="flex-1 h-6 rounded-full mr-4"
            style={{
              background: 'linear-gradient(to right, hsl(180, 50%, 25%), hsl(180, 75%, 45%), hsl(180, 100%, 60%))'
            }}
          ></div>
          <div className="flex flex-col text-xs text-slate-400">
            <span>Baixa</span>
            <span>Alta</span>
          </div>
        </div>
      </div>
    </div>
  );
};
