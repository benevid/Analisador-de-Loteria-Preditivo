import React, { useMemo } from 'react';
import type { AnalysisResult } from '../types';

interface Matrix2DViewProps {
  analysis: AnalysisResult;
}

const GRID_SIZE = 5;
const CELL_SIZE = 100;
const PADDING = 50;
const NODE_RADIUS = 18;

export const Matrix2DView: React.FC<Matrix2DViewProps> = ({ analysis }) => {
  const { nodes, edges } = analysis;

  const nodePositions = useMemo(() => {
    const positions = new Map<number, { x: number; y: number }>();
    for (let i = 0; i < 25; i++) {
      const num = i + 1;
      const row = Math.floor(i / GRID_SIZE);
      const col = i % GRID_SIZE;
      positions.set(num, {
        x: col * CELL_SIZE + PADDING,
        y: row * CELL_SIZE + PADDING,
      });
    }
    return positions;
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${GRID_SIZE * CELL_SIZE} ${GRID_SIZE * CELL_SIZE}`}
      >
        <g>
          {edges.map((edge) => {
            const sourcePos = nodePositions.get(edge.source);
            const targetPos = nodePositions.get(edge.target);
            if (!sourcePos || !targetPos) return null;

            const { x: x1, y: y1 } = sourcePos;
            const { x: x2, y: y2 } = targetPos;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const dx = x2 - x1;
            const dy = y2 - y1;

            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return null;

            const normX = dx / dist;
            const normY = dy / dist;
            
            const curveFactor = 0.15;
            const curveAmount = dist * curveFactor;

            const controlX = midX - curveAmount * normY;
            const controlY = midY + curveAmount * normX;

            const pathData = `M${x1},${y1} Q${controlX},${controlY} ${x2},${y2}`;

            return (
              <path
                key={`${edge.source}-${edge.target}`}
                d={pathData}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={1}
                fill="none"
              />
            );
          })}
        </g>
        <g>
          {nodes.map((node) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;
            return (
              <g key={node.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS}
                  fill="rgba(0, 255, 255, 0.15)"
                  stroke="cyan"
                  strokeWidth={1.5}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dy=".3em"
                  fill="#e2e8f0"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};