import React, { useMemo } from 'react';
import type { AnalysisResult, Game } from '../types';
import { analyzeGamesSequential } from '../services/lotteryService';

interface Matrix2DViewProps {
  analysis: AnalysisResult;
  games: Game[]; // Precisamos dos jogos originais para análise sequencial
  gameCount: number; // Número atual do slider
}

export const Matrix2DView: React.FC<Matrix2DViewProps> = ({ analysis, games, gameCount }) => {
  
  // Usar análise SEQUENCIAL para Matriz 2D (conexões apenas entre números adjacentes)
  const sequentialAnalysis = useMemo(() => {
    if (games.length === 0) return analysis;
    return analyzeGamesSequential(games, gameCount) || analysis;
  }, [games, gameCount, analysis]);

  const { nodes, edges } = sequentialAnalysis;

  console.log('FORMA 2 - Matrix2DView SEQUENCIAL - nodes:', nodes.length, 'edges:', edges.length);
  console.log('FORMA 2 - Primeiras 5 arestas:', edges.slice(0, 5).map(e => `${e.source}->${e.target} (${e.frequency}x)`));

  // FORMA 2: Posições fixas em grid 5x5 - QUADRO 2D
  const nodePositions = useMemo(() => {
    const positions = new Map<number, { x: number; y: number }>();
    const cellSize = 80;
    const startX = 120; // Mais centralizado
    const startY = 120;
    
    // Organizar 25 dezenas em matriz 5x5
    for (let i = 0; i < 25; i++) {
      const num = i + 1;
      const row = Math.floor(i / 5);
      const col = i % 5;
      positions.set(num, {
        x: startX + col * cellSize,
        y: startY + row * cellSize,
      });
    }
    
    return positions;
  }, []);

  // FORMA 2: CONEXÕES SEQUENCIAIS APENAS
  const sequentialEdges = useMemo(() => {
    // Mostrar todas as arestas sequenciais que existem
    const validEdges = edges.filter(edge => edge.frequency > 0);
    console.log('FORMA 2 - Conexões sequenciais encontradas:', validEdges.length);
    
    return validEdges; // Mostrar todas (já são poucas por serem sequenciais)
  }, [edges]);

  // FORMA 2: Função para cores mais vibrantes baseadas na repetição
  const getEdgeVibrancy = (normalizedFreq: number) => {
    // Mais repetições = cores mais vibrantes
    const intensity = normalizedFreq;
    const hue = 180 + intensity * 60; // Ciano -> Verde/Amarelo
    const saturation = 60 + intensity * 40; // Mais saturado
    const lightness = 45 + intensity * 25; // Mais claro
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const getNodeVibrancy = (normalizedFreq: number) => {
    // Números que mais se repetem = cores mais vibrantes
    const intensity = normalizedFreq;
    const hue = 200 + intensity * 80; // Azul -> Verde
    const saturation = 70 + intensity * 30;
    const lightness = 40 + intensity * 35;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 p-4">
      <div className="relative bg-slate-800 rounded-lg border border-slate-700">
        <svg
          width={640}
          height={640}
          className="rounded-lg"
          viewBox="0 0 640 640"
        >
          {/* Título */}
          <text x={320} y={30} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
            FORMA 2: Quadro 2D - Matriz 5x5
          </text>
          
          {/* Subtítulo */}
          <text x={320} y={50} textAnchor="middle" fill="#94a3b8" fontSize="12">
            Caminhos que mais se repetem nos resultados (Conexões Curvas)
          </text>

          {/* Grid de fundo - espaços idênticos */}
          <defs>
            <pattern id="matrix-grid" width={80} height={80} patternUnits="userSpaceOnUse">
              <rect width={80} height={80} fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1"/>
            </pattern>
            
            {/* DEFINIÇÕES PARA SETAS */}
            {sequentialEdges.map((edge, index) => {
              const edgeColor = getEdgeVibrancy(edge.normalizedFrequency);
              const opacity = 0.5 + edge.normalizedFrequency * 0.5;
              
              return (
                <marker
                  key={`arrow-marker-${index}`}
                  id={`arrow-${index}`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="3"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill={edgeColor} opacity={opacity} />
                </marker>
              );
            })}
          </defs>
          
          <rect width={400} height={400} x={120} y={120} fill="url(#matrix-grid)" />

          {/* ARESTAS - Conexões sequenciais com linhas CURVAS */}
          {sequentialEdges.map((edge, index) => {
            const sourcePos = nodePositions.get(edge.source);
            const targetPos = nodePositions.get(edge.target);
            if (!sourcePos || !targetPos) return null;

            const edgeColor = getEdgeVibrancy(edge.normalizedFrequency);
            const strokeWidth = 2 + edge.normalizedFrequency * 4;
            const opacity = 0.5 + edge.normalizedFrequency * 0.5;

            // Calcular CURVA para não passar por cima dos nós
            const dx = targetPos.x - sourcePos.x;
            const dy = targetPos.y - sourcePos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Determinar se curva vai para fora ou dentro da matriz
            const centerX = 320; // Centro do grid 5x5
            const centerY = 320;
            const sourceFromCenter = Math.sqrt((sourcePos.x - centerX)**2 + (sourcePos.y - centerY)**2);
            const targetFromCenter = Math.sqrt((targetPos.x - centerX)**2 + (targetPos.y - centerY)**2);
            
            // Se ambos estão na borda, curva externa; se ambos no centro, curva interna
            const isOuterConnection = (sourceFromCenter > 120 && targetFromCenter > 120);
            const curvature = distance * 0.3; // Intensidade da curva
            
            // Ponto de controle da curva (perpendicular à linha)
            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;
            
            // Vetor perpendicular normalizado
            const perpX = -dy / distance;
            const perpY = dx / distance;
            
            // Curva para fora (conexões de borda) ou para dentro (conexões centrais)
            const curveDirection = isOuterConnection ? 1 : -0.6;
            const controlX = midX + perpX * curvature * curveDirection;
            const controlY = midY + perpY * curvature * curveDirection;
            
            // Path da curva quadrática
            const pathData = `M ${sourcePos.x},${sourcePos.y} Q ${controlX},${controlY} ${targetPos.x},${targetPos.y}`;

            if (index < 3) {
              console.log(`FORMA 2 - Conexão curva ${index + 1}:`, 
                edge.source, '→', edge.target, 
                `curvatura: ${isOuterConnection ? 'externa' : 'interna'}`
              );
            }

            return (
              <g key={`path-${edge.source}-${edge.target}`}>
                {/* Linha curva principal */}
                <path
                  d={pathData}
                  stroke={edgeColor}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  fill="none"
                  markerEnd={`url(#arrow-${index})`}
                />
                
                {/* Efeito glow para conexões mais frequentes */}
                {edge.normalizedFrequency > 0.7 && (
                  <path
                    d={pathData}
                    stroke={edgeColor}
                    strokeWidth={strokeWidth + 2}
                    opacity={0.3}
                    fill="none"
                    filter="blur(2px)"
                  />
                )}
              </g>
            );
          })}

          {/* NÓS - Círculos com números, cores vibrantes por repetição */}
          {nodes.map((node) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            const nodeColor = getNodeVibrancy(node.normalizedFrequency);
            const radius = 16 + node.normalizedFrequency * 8; // Maior = mais frequente
            const borderWidth = 2 + node.normalizedFrequency * 3; // Contorno mais forte

            return (
              <g key={`number-${node.id}`}>
                {/* Círculo de fundo com glow */}
                {node.normalizedFrequency > 0.6 && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 4}
                    fill={nodeColor}
                    opacity={0.3}
                    filter="blur(3px)"
                  />
                )}
                
                {/* Círculo principal */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={nodeColor}
                  stroke="white"
                  strokeWidth={borderWidth}
                  opacity={0.9}
                />
                
                {/* Número */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {node.id}
                </text>
                
                {/* Indicador de frequência */}
                <text
                  x={pos.x}
                  y={pos.y + radius + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                >
                  {node.frequency}x
                </text>
              </g>
            );
          })}

          {/* Legenda */}
          <g transform="translate(20, 560)">
            <rect
              width="600"
              height="50"
              fill="rgba(30, 41, 59, 0.95)"
              stroke="rgba(148, 163, 184, 0.3)"
              rx="8"
            />
            <text x={15} y={20} fill="white" fontSize="12" fontWeight="bold">
              Legenda:
            </text>
            
            {/* Exemplo de nó */}
            <circle cx="80" cy="30" r="8" fill="hsl(220, 80%, 60%)" stroke="white" strokeWidth="2" />
            <text x="95" y="35" fill="#94a3b8" fontSize="10">Número (frequência)</text>
            
            {/* Exemplo de linha curva fraca */}
            <path d="M 200 30 Q 215 20 230 30" stroke="hsl(180, 60%, 50%)" strokeWidth="1" opacity="0.6" fill="none"/>
            <text x="240" y="35" fill="#94a3b8" fontSize="10">Conexão curva fraca</text>
            
            {/* Exemplo de linha curva forte */}
            <path d="M 380 30 Q 395 40 410 30" stroke="hsl(240, 100%, 70%)" strokeWidth="4" opacity="0.9" fill="none"/>
            <text x="420" y="35" fill="#94a3b8" fontSize="10">Conexão curva forte</text>
          </g>

          {/* Info de dados */}
          <text x={320} y={630} textAnchor="middle" fill="#64748b" fontSize="11">
            Mostrando {sequentialEdges.length} conexões sequenciais curvas de {gameCount} resultado(s)
          </text>
        </svg>
      </div>
    </div>
  );
};