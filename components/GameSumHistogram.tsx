import React, { useRef, useEffect, useState } from 'react';
import type { AnalysisResult } from '../types';

interface GameSumHistogramProps {
  analysis: AnalysisResult;
}

export const GameSumHistogram: React.FC<GameSumHistogramProps> = ({ analysis }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const { gameSumDistribution } = analysis;

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const { height } = containerRef.current.getBoundingClientRect();
        setContainerHeight(Math.max(300, height - 120)); // Reserve space for labels
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, []);

  if (!gameSumDistribution || gameSumDistribution.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <div>Não há dados suficientes para exibir o histograma.</div>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const totalJogos = gameSumDistribution.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...gameSumDistribution.map(item => item.count));
  const mostFrequentRange = gameSumDistribution.reduce((prev, current) => 
    current.count > prev.count ? current : prev
  );

  return (
    <div ref={containerRef} className="histogram-container w-full h-full flex flex-col p-4">
      {/* Header com estatísticas */}
      <div className="flex-shrink-0 mb-6">
        <h3 className="text-lg font-bold text-white mb-2 text-center">
          Distribuição da Soma dos Jogos
        </h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
          <span>Total de Jogos: <strong className="text-white">{totalJogos}</strong></span>
          <span>Mais Comum: <strong className="text-cyan-400">{mostFrequentRange.sumRange}</strong> 
            ({mostFrequentRange.count} jogos)</span>
        </div>
      </div>

      {/* Área do gráfico */}
      <div className="flex-1 min-h-0 relative">
        <div className="w-full h-full flex items-end justify-center gap-1 sm:gap-2 relative">
          {/* Linha base */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-600"></div>
          
          {/* Barras do histograma */}
          {gameSumDistribution.map(({ sumRange, count, normalizedCount }, index) => {
            const barHeight = Math.max((count / maxCount) * containerHeight, 4);
            const percentage = ((count / totalJogos) * 100).toFixed(1);
            
            return (
              <div
                key={sumRange}
                className="flex-1 max-w-12 group relative flex flex-col items-center"
              >
                {/* Barra */}
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm 
                           transition-all duration-300 group-hover:from-cyan-500 group-hover:to-cyan-300
                           shadow-lg group-hover:shadow-cyan-500/25 relative overflow-hidden"
                  style={{ height: `${barHeight}px` }}
                >
                  {/* Efeito de brilho na barra */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                                transition-transform duration-700 ease-out"></div>
                  
                  {/* Valor no topo da barra */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 
                                text-xs font-bold text-white opacity-0 group-hover:opacity-100 
                                transition-opacity duration-200">
                    {count}
                  </div>
                </div>
                
                {/* Label da faixa */}
                <div className="text-xs text-slate-400 mt-2 text-center whitespace-nowrap transform rotate-45 sm:rotate-0">
                  {sumRange}
                </div>
                
                {/* Tooltip detalhado */}
                <div className="absolute bottom-full mb-8 left-1/2 transform -translate-x-1/2 
                              opacity-0 group-hover:opacity-100 transition-all duration-200
                              bg-slate-800 text-white text-xs rounded-lg px-3 py-2 
                              border border-slate-600 shadow-lg z-10 whitespace-nowrap">
                  <div className="space-y-1">
                    <div><strong>Faixa:</strong> {sumRange}</div>
                    <div><strong>Jogos:</strong> {count}</div>
                    <div><strong>Percentual:</strong> {percentage}%</div>
                  </div>
                  {/* Seta do tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                                border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda e informações adicionais */}
      <div className="flex-shrink-0 mt-6 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-400">
            <strong className="text-white">Interpretação:</strong> Mostra quantos jogos tiveram soma dentro de cada faixa
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-3 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded"></div>
            <span className="text-slate-400">Frequência dos jogos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
