import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Game, AnalysisResult, GenerationOptions } from './types';
import { parseAndMergeGames, analyzeGames, generateGame } from './services/lotteryService';
import { Matrix2DView } from './components/Matrix2DView';
import { ThreeScene } from './components/ThreeScene';
import { DataView } from './components/DataView';
import { AiAssistant } from './components/AiAssistant';
import { FrequencyHeatmap } from './components/FrequencyHeatmap';
import { GameSumHistogram } from './components/GameSumHistogram';

// --- ICONS (as components) ---
const ChartBarIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="M18 17.9v-5.8"/><path d="M13 17.9v-3.8"/><path d="M8 17.9v-7.8"/></svg>
);
const WandIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 4V2"/><path d="M15 10V8"/><path d="M11.5 6.5L10 5"/><path d="M6.5 11.5L5 10"/><path d="m22 2-3 3"/><path d="M3 22 2 21"/><path d="M15 14h-2"/><path d="M20 15h2"/><path d="M15 20v-2"/><path d="M20 15v-2"/><path d="m14 15-1.9 1.9"/><path d="M10.4 10.4 5 15.8"/><path d="M5.4 5.4 2 9l3.5 3.5L9 9Z"/></svg>
);
const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const TableIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.37 3.63a2.12 2.12 0 1 1 3 3L12 16l-4 1 1-4Z"/></svg>
);


const App: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [generatedGames, setGeneratedGames] = useState<Game[]>([]);
    const [activeSection, setActiveSection] = useState<'dashboard' | 'generator' | 'data'>('dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Effect to auto-clear notifications
    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    useEffect(() => {
        if(games.length > 0) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                const newAnalysis = analyzeGames(games);
                setAnalysis(newAnalysis);
                setIsLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setAnalysis(null);
        }
    }, [games]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const fileContent = await file.text();
            const initialGameCount = games.length;
            const updatedGames = await parseAndMergeGames(fileContent, games);
            const numAdded = updatedGames.length - initialGameCount;

            if (numAdded > 0) {
                setGames(updatedGames);
                setSuccessMessage(`${numAdded} novo(s) jogo(s) adicionado(s) com sucesso!`);
            } else {
                setIsLoading(false);
                setSuccessMessage('Nenhum jogo novo encontrado ou os jogos do arquivo já existem na base de dados.');
            }
        } catch (err) {
            setError('Falha ao processar o arquivo CSV. Verifique o formato e se os números estão entre 1 e 25.');
            console.error(err);
            setIsLoading(false);
        } finally {
            event.target.value = ''; // Reset input
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col p-4 md:p-6 lg:p-8 gap-6">
            <Header activeSection={activeSection} setActiveSection={setActiveSection} handleFileUpload={handleFileUpload}/>
            
            {/* Notifications Area */}
            <div className="fixed top-5 right-5 w-full max-w-sm z-50">
                 {error && <Notification type="error" message={error} onDismiss={() => setError(null)} />}
                 {successMessage && <Notification type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}
            </div>

            <main className="flex-grow flex flex-col min-h-0">
                {isLoading && (
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-xl animate-pulse">Analisando dados...</div>
                    </div>
                )}
                
                {!isLoading && !analysis && (
                     <div className="flex-grow flex items-center justify-center text-center">
                        <div>
                           <h2 className="text-2xl font-bold mb-2">Sem Dados para Analisar</h2>
                           <p className="text-slate-400">Por favor, carregue um arquivo CSV com os resultados da loteria para começar.</p>
                        </div>
                    </div>
                )}

                {!isLoading && analysis && (
                    <div className="flex-grow min-h-0">
                        <div className={`${activeSection === 'dashboard' ? 'h-full' : 'hidden'}`}>
                            <Dashboard analysis={analysis} />
                        </div>
                         <div className={`${activeSection === 'data' ? 'block' : 'hidden'} h-full`}>
                            <DataView games={games} />
                        </div>
                        <div className={`${activeSection === 'generator' ? 'block' : 'hidden'} h-full`}>
                            <NumberGenerator 
                                analysis={analysis}
                                existingGames={games}
                                generatedGames={generatedGames}
                                setGeneratedGames={setGeneratedGames}
                                setError={setError}
                            />
                        </div>
                    </div>
                )}
            </main>
            <AiAssistant analysis={analysis} />
        </div>
    );
};

// --- Child Components ---

const Notification: React.FC<{ type: 'success' | 'error'; message: string; onDismiss: () => void; }> = ({ type, message, onDismiss }) => {
    const baseClasses = 'p-4 rounded-lg mb-4 shadow-lg flex items-center justify-between transition-all duration-300 backdrop-blur-sm';
    const typeClasses = {
        success: 'bg-green-500/80 border border-green-400 text-white',
        error: 'bg-red-500/80 border border-red-400 text-white'
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <span>{message}</span>
            <button onClick={onDismiss} className="ml-4 opacity-70 hover:opacity-100 text-xl font-bold">&times;</button>
        </div>
    );
};

const Header: React.FC<{
    activeSection: string;
    setActiveSection: (section: 'dashboard' | 'generator' | 'data') => void;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ activeSection, setActiveSection, handleFileUpload }) => (
    <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-cyan-400">Analisador de Loteria</h1>
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg">
            <button onClick={() => setActiveSection('dashboard')} className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${activeSection === 'dashboard' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'}`}><ChartBarIcon className="w-5 h-5"/> Dashboard</button>
            <button onClick={() => setActiveSection('data')} className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${activeSection === 'data' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'}`}><TableIcon className="w-5 h-5"/> Dados</button>
            <button onClick={() => setActiveSection('generator')} className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${activeSection === 'generator' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'}`}><WandIcon className="w-5 h-5" /> Gerador</button>
        </div>
        <div>
            <label htmlFor="csv-upload" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors">
                <UploadIcon className="w-5 h-5" />
                Carregar CSV
            </label>
            <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
        </div>
    </header>
);

const Dashboard: React.FC<{ analysis: AnalysisResult }> = ({ analysis }) => {
    const [view, setView] = useState<'3d-graph' | '2d-matrix' | '3d-interactive' | 'heatmap' | 'sum-histogram'>('3d-graph');
    
    const { mostFrequent, leastFrequent } = useMemo(() => {
        if (!analysis || analysis.nodes.length === 0) {
            return { mostFrequent: null, leastFrequent: null };
        }
        let most = analysis.nodes[0];
        let least = analysis.nodes[0];
        for (const node of analysis.nodes) {
            if (node.frequency > most.frequency) most = node;
            if (node.frequency < least.frequency) least = node;
        }
        return { mostFrequent: most, leastFrequent: least };
    }, [analysis]);

    return (
        <div className="grid grid-rows-[auto_auto_1fr] h-full gap-4">
             {/* Row 1: Stats */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-400">Total de Jogos Analisados</h4>
                    <p className="text-2xl font-bold text-cyan-400">{analysis.totalGames}</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-400">Dezena Mais Frequente</h4>
                    <p className="text-2xl font-bold text-white">{mostFrequent ? `${mostFrequent.id}` : 'N/A'} <span className="text-sm text-slate-400">({mostFrequent?.frequency} vezes)</span></p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-400">Dezena Menos Frequente</h4>
                    <p className="text-2xl font-bold text-white">{leastFrequent ? `${leastFrequent.id}` : 'N/A'} <span className="text-sm text-slate-400">({leastFrequent?.frequency} vezes)</span></p>
                </div>
            </div>
            
            {/* Row 2: Buttons */}
            <div className="flex justify-center bg-slate-800 p-1 rounded-lg self-center flex-wrap">
                <button onClick={() => setView('3d-graph')} className={`px-4 py-2 rounded-md transition-colors ${view === '3d-graph' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'}`}>Grafo 3D</button>
                <button onClick={() => setView('2d-matrix')} className={`px-4 py-2 rounded-md transition-colors ${view === '2d-matrix' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'}`}>Quadro 2D</button>
                <button onClick={() => setView('heatmap')} className={`px-4 py-2 rounded-md transition-colors ${view === 'heatmap' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'}`}>Mapa de Calor</button>
                <button onClick={() => setView('sum-histogram')} className={`px-4 py-2 rounded-md transition-colors ${view === 'sum-histogram' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'}`}>Histograma de Somas</button>
                <button onClick={() => setView('3d-interactive')} className={`px-4 py-2 rounded-md transition-colors ${view === '3d-interactive' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'}`}>Interativo 3D</button>
            </div>
            
            {/* Row 3: Visualization Area */}
            <div className="w-full bg-slate-800 rounded-lg p-2 relative min-h-0">
                 {view === '2d-matrix' && <Matrix2DView analysis={analysis} />}
                 {view === '3d-graph' && <ThreeScene analysis={analysis} mode="graph" />}
                 {view === '3d-interactive' && <ThreeScene analysis={analysis} mode="interactive" />}
                 {view === 'heatmap' && <FrequencyHeatmap analysis={analysis} />}
                 {view === 'sum-histogram' && <GameSumHistogram analysis={analysis} />}
            </div>
        </div>
    );
};

const NumberGenerator: React.FC<{
    analysis: AnalysisResult;
    existingGames: Game[];
    generatedGames: Game[];
    setGeneratedGames: React.Dispatch<React.SetStateAction<Game[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ analysis, existingGames, generatedGames, setGeneratedGames, setError }) => {
    const [options, setOptions] = useState<GenerationOptions>({
        avoidExistingGames: true,
        avoidSequences: true,
        minNodeStrength: 0.1,
        minEdgeStrength: 0.1,
    });
    const [lastGenerated, setLastGenerated] = useState<Game | null>(null);

    const handleGenerate = () => {
        const newGame = generateGame(analysis, options, [...existingGames, ...generatedGames]);
        if (newGame) {
            setLastGenerated(newGame);
        } else {
            setLastGenerated(null);
            setError("Não foi possível gerar um jogo. Tente ajustar os filtros de força para serem menos restritivos.");
        }
    };

    const handleSave = () => {
        if (lastGenerated && !generatedGames.some(g => JSON.stringify(g) === JSON.stringify(lastGenerated))) {
            setGeneratedGames(prev => [...prev, lastGenerated]);
            setLastGenerated(null);
        }
    };

    const handleDelete = (index: number) => {
        setGeneratedGames(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="md:col-span-1 bg-slate-800 p-6 rounded-lg flex flex-col gap-6">
                <h3 className="text-xl font-bold border-b border-slate-600 pb-2">Opções de Geração</h3>
                <div className="flex items-center justify-between">
                    <label htmlFor="avoid-existing">Evitar jogos existentes</label>
                    <input type="checkbox" id="avoid-existing" className="form-checkbox h-5 w-5 bg-slate-700 border-slate-500 rounded text-cyan-500 focus:ring-cyan-500" checked={options.avoidExistingGames} onChange={e => setOptions(o => ({...o, avoidExistingGames: e.target.checked}))} />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="avoid-sequences">Evitar sequências de 3+</label>
                    <input type="checkbox" id="avoid-sequences" className="form-checkbox h-5 w-5 bg-slate-700 border-slate-500 rounded text-cyan-500 focus:ring-cyan-500" checked={options.avoidSequences} onChange={e => setOptions(o => ({...o, avoidSequences: e.target.checked}))} />
                </div>
                <div>
                    <label htmlFor="min-node" className="block mb-2">Força mínima do nó (0-1)</label>
                    <input type="range" id="min-node" min="0" max="1" step="0.05" value={options.minNodeStrength} onChange={e => setOptions(o => ({...o, minNodeStrength: parseFloat(e.target.value)}))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                    <label htmlFor="min-edge" className="block mb-2">Força mínima da aresta (0-1)</label>
                    <input type="range" id="min-edge" min="0" max="1" step="0.05" value={options.minEdgeStrength} onChange={e => setOptions(o => ({...o, minEdgeStrength: parseFloat(e.target.value)}))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                </div>
                <button onClick={handleGenerate} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-lg">
                    <WandIcon /> Gerar Novo Jogo
                </button>
                 {lastGenerated && (
                    <div className="bg-slate-700 p-4 rounded-lg text-center">
                        <h4 className="font-bold mb-2">Jogo Gerado:</h4>
                        <div className="grid grid-cols-5 gap-2">
                           {lastGenerated.map(num => <div key={num} className="bg-cyan-400 text-slate-900 rounded-full w-8 h-8 flex items-center justify-center font-bold mx-auto">{num}</div>)}
                        </div>
                        <button onClick={handleSave} className="mt-4 bg-green-600 hover:bg-green-500 text-white py-1 px-3 rounded-md text-sm">Salvar Jogo</button>
                    </div>
                )}
                 {!lastGenerated && generatedGames.length === 0 && (
                     <p className="text-slate-400 text-center">Nenhum jogo gerado ainda. Clique no botão acima para começar!</p>
                 )}
            </div>
            <div className="md:col-span-2 bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold border-b border-slate-600 pb-2 mb-4">Jogos Salvos</h3>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    {generatedGames.map((game, index) => (
                        <div key={index} className="bg-slate-700 p-3 rounded-lg flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                               {game.map(num => <span key={num} className="bg-slate-600 text-slate-200 rounded-full w-7 h-7 flex items-center justify-center text-sm font-medium">{num}</span>)}
                            </div>
                            <button onClick={() => handleDelete(index)} className="text-slate-400 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                    {generatedGames.length === 0 && <p className="text-slate-400 text-center py-8">Seus jogos salvos aparecerão aqui.</p>}
                </div>
            </div>
        </div>
    );
}

export default App;
