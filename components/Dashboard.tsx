import React, { useState, useEffect, useMemo, Suspense } from 'react';
import type { AnalysisResult, Game } from '../types';
import { Matrix2DView } from './Matrix2DView';
import { FrequencyHeatmap } from './FrequencyHeatmap';
import { GameSumHistogram } from './GameSumHistogram';
import { LoadingSpinner } from './UI/Icons';
import { GameSlider } from './UI/GameSlider';
import { analyzeGamesIncremental } from '../services/lotteryService';

// Lazy load do ThreeScene
const ThreeScene = React.lazy(() => import('./ThreeScene').then(module => ({ 
    default: module.ThreeScene 
})));

interface DashboardProps {
    analysis: AnalysisResult;
    games: Game[]; // Adicionar games para análise incremental
    isMobile: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ analysis, games, isMobile }) => {
    const [view, setView] = useState<'heatmap' | '2d-matrix' | '3d-graph' | '3d-interactive' | 'sum-histogram'>('heatmap');
    const [gameCount, setGameCount] = useState(games.length); // Estado do slider
    
    // Análise incremental baseada no slider
    const incrementalAnalysis = useMemo(() => {
        if (gameCount === games.length) {
            return analysis; // Usar análise completa se é o máximo
        }
        return analyzeGamesIncremental(games, gameCount) || analysis;
    }, [games, gameCount, analysis]);
    
    const { mostFrequent, leastFrequent } = useMemo(() => {
        if (!incrementalAnalysis || incrementalAnalysis.nodes.length === 0) {
            return { mostFrequent: null, leastFrequent: null };
        }
        let most = incrementalAnalysis.nodes[0];
        let least = incrementalAnalysis.nodes[0];
        for (const node of incrementalAnalysis.nodes) {
            if (node.frequency > most.frequency) most = node;
            if (node.frequency < least.frequency) least = node;
        }
        return { mostFrequent: most, leastFrequent: least };
    }, [incrementalAnalysis]);

    // No mobile, usar vista mais simples por padrão
    useEffect(() => {
        if (isMobile && view.includes('3d')) {
            setView('heatmap');
        }
    }, [isMobile, view]);

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Stats - altura fixa */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-shrink-0">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700/50 text-center">
                    <h4 className="text-sm font-semibold text-slate-400 mb-1">Total de Jogos</h4>
                    <p className="text-2xl font-bold text-cyan-400">{incrementalAnalysis.totalGames}</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700/50 text-center">
                    <h4 className="text-sm font-semibold text-slate-400 mb-1">Mais Frequente</h4>
                    <p className="text-2xl font-bold text-white">
                        {mostFrequent ? mostFrequent.id : 'N/A'}
                    </p>
                    {mostFrequent && (
                        <span className="text-sm text-slate-400">({mostFrequent.frequency}x)</span>
                    )}
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700/50 text-center">
                    <h4 className="text-sm font-semibold text-slate-400 mb-1">Menos Frequente</h4>
                    <p className="text-2xl font-bold text-white">
                        {leastFrequent ? leastFrequent.id : 'N/A'}
                    </p>
                    {leastFrequent && (
                        <span className="text-sm text-slate-400">({leastFrequent.frequency}x)</span>
                    )}
                </div>
            </div>
            
            {/* Slider de Controle Incremental */}
            <div className="flex-shrink-0 bg-slate-800 p-4 rounded-lg border border-slate-700/50">
                <GameSlider
                    totalGames={games.length}
                    currentGames={gameCount}
                    onGameCountChange={setGameCount}
                />
            </div>
            
            {/* Botões de visualização - altura fixa */}
            <div className="flex justify-center flex-shrink-0">
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700/50">
                    <ViewButton 
                        active={view === 'heatmap'} 
                        onClick={() => setView('heatmap')} 
                        label="Mapa de Calor" 
                        isMobile={isMobile}
                    />
                    <ViewButton 
                        active={view === '2d-matrix'} 
                        onClick={() => setView('2d-matrix')} 
                        label="Matriz 2D"
                        isMobile={isMobile}
                    />
                    <ViewButton 
                        active={view === 'sum-histogram'} 
                        onClick={() => setView('sum-histogram')} 
                        label="Histograma"
                        isMobile={isMobile}
                    />
                    {!isMobile && (
                        <>
                            <ViewButton 
                                active={view === '3d-graph'} 
                                onClick={() => setView('3d-graph')} 
                                label="Grafo 3D"
                                isMobile={isMobile}
                            />
                            <ViewButton 
                                active={view === '3d-interactive'} 
                                onClick={() => setView('3d-interactive')} 
                                label="3D Interativo"
                                isMobile={isMobile}
                            />
                        </>
                    )}
                </div>
            </div>
            
            {/* Área de visualização - ocupa todo espaço restante */}
            <div className="flex-1 min-h-0 bg-slate-800 rounded-lg border border-slate-700/50 p-4 relative">
                {/* Renderização condicional das visualizações */}
                {view === '2d-matrix' && (
                    <div className="w-full h-full">
                        <Matrix2DView 
                            analysis={incrementalAnalysis} 
                            games={games}
                            gameCount={gameCount}
                        />
                    </div>
                )}
                
                {view === 'heatmap' && (
                    <div className="w-full h-full">
                        <FrequencyHeatmap analysis={incrementalAnalysis} />
                    </div>
                )}
                
                {view === 'sum-histogram' && (
                    <div className="w-full h-full">
                        <GameSumHistogram analysis={incrementalAnalysis} />
                    </div>
                )}
                
                {view === '3d-graph' && !isMobile && (
                    <div className="w-full h-full">
                        <Suspense fallback={<LoadingFallback message="Carregando Grafo 3D..." />}>
                            <ThreeScene 
                                analysis={incrementalAnalysis} 
                                games={games}
                                gameCount={gameCount}
                                mode="graph" 
                            />
                        </Suspense>
                    </div>
                )}
                
                {view === '3d-interactive' && !isMobile && (
                    <div className="w-full h-full">
                        <Suspense fallback={<LoadingFallback message="Carregando 3D Interativo..." />}>
                            <ThreeScene 
                                analysis={incrementalAnalysis} 
                                games={games}
                                gameCount={gameCount}
                                mode="interactive" 
                            />
                        </Suspense>
                    </div>
                )}
                
                {/* Info overlay */}
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm rounded px-3 py-1 text-xs text-cyan-400 font-medium">
                    {getViewTitle(view)}
                </div>
            </div>
        </div>
    );
};

// Componente de botão de visualização
const ViewButton: React.FC<{
    active: boolean;
    onClick: () => void;
    label: string;
    isMobile: boolean;
}> = ({ active, onClick, label, isMobile }) => (
    <button 
        onClick={onClick} 
        className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${
            active 
                ? 'bg-cyan-500 text-white' 
                : 'hover:bg-slate-700 text-slate-300'
        }`}
    >
        {isMobile && label.length > 10 ? label.split(' ')[0] : label}
    </button>
);

// Loading fallback
const LoadingFallback: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center h-full">
        <div className="text-center">
            <LoadingSpinner size="md" />
            <p className="text-sm text-slate-400 mt-2">{message}</p>
        </div>
    </div>
);

// Helper para títulos
const getViewTitle = (view: string): string => {
    const titles = {
        'heatmap': 'Mapa de Calor',
        '2d-matrix': 'Matriz 2D',
        'sum-histogram': 'Histograma',
        '3d-graph': 'Grafo 3D',
        '3d-interactive': '3D Interativo'
    };
    return titles[view as keyof typeof titles] || view;
};
