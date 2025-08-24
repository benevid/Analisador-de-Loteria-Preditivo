import React, { useState, useCallback } from 'react';
import type { Game, AnalysisResult, GenerationOptions } from '../types';
import { generateGame } from '../services/lotteryService';
import { WandIcon, UploadIcon, TrashIcon, LoadingSpinner } from './UI/Icons';

interface NumberGeneratorProps {
    analysis: AnalysisResult;
    existingGames: Game[];
    generatedGames: Game[];
    setGeneratedGames: React.Dispatch<React.SetStateAction<Game[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    isMobile: boolean;
}

export const NumberGenerator: React.FC<NumberGeneratorProps> = ({ 
    analysis, 
    existingGames, 
    generatedGames, 
    setGeneratedGames, 
    setError, 
    isMobile 
}) => {
    const [options, setOptions] = useState<GenerationOptions>({
        avoidExistingGames: true,
        avoidSequences: true,
        minNodeStrength: 0.1,
        minEdgeStrength: 0.1,
    });
    const [lastGenerated, setLastGenerated] = useState<Game | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = useCallback(async () => {
        setIsGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const newGame = generateGame(analysis, options, [...existingGames, ...generatedGames]);
            if (newGame) {
                setLastGenerated(newGame);
            } else {
                setLastGenerated(null);
                setError("Não foi possível gerar um jogo. Tente ajustar os filtros para serem menos restritivos.");
            }
        } catch (err) {
            setError("Erro ao gerar jogo. Tente novamente.");
            console.error('Erro na geração:', err);
        } finally {
            setIsGenerating(false);
        }
    }, [analysis, options, existingGames, generatedGames, setError]);

    const handleSave = useCallback(() => {
        if (lastGenerated && !generatedGames.some(g => JSON.stringify(g.sort()) === JSON.stringify([...lastGenerated].sort()))) {
            setGeneratedGames(prev => [...prev, lastGenerated]);
            setLastGenerated(null);
        }
    }, [lastGenerated, generatedGames, setGeneratedGames]);

    const handleDelete = useCallback((index: number) => {
        setGeneratedGames(prev => prev.filter((_, i) => i !== index));
    }, [setGeneratedGames]);

    const handleExportGames = useCallback(() => {
        if (generatedGames.length === 0) return;
        
        const csvContent = generatedGames.map((game, index) => {
            const sortedGame = [...game].sort((a, b) => a - b);
            return `Jogo${index + 1},${sortedGame.join(',')}`;
        }).join('\n');
        
        const blob = new Blob([`Jogo,${Array.from({length: 15}, (_, i) => `Bola${i + 1}`).join(',')}\n${csvContent}`], 
                              { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jogos-gerados-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [generatedGames]);

    if (isMobile) {
        return <MobileGenerator 
            options={options}
            setOptions={setOptions}
            handleGenerate={handleGenerate}
            handleSave={handleSave}
            handleDelete={handleDelete}
            handleExportGames={handleExportGames}
            lastGenerated={lastGenerated}
            generatedGames={generatedGames}
            isGenerating={isGenerating}
        />;
    }

    return <DesktopGenerator 
        options={options}
        setOptions={setOptions}
        handleGenerate={handleGenerate}
        handleSave={handleSave}
        handleDelete={handleDelete}
        handleExportGames={handleExportGames}
        lastGenerated={lastGenerated}
        generatedGames={generatedGames}
        isGenerating={isGenerating}
    />;
};

const MobileGenerator: React.FC<{
    options: GenerationOptions;
    setOptions: React.Dispatch<React.SetStateAction<GenerationOptions>>;
    handleGenerate: () => void;
    handleSave: () => void;
    handleDelete: (index: number) => void;
    handleExportGames: () => void;
    lastGenerated: Game | null;
    generatedGames: Game[];
    isGenerating: boolean;
}> = ({ options, setOptions, handleGenerate, handleSave, handleDelete, handleExportGames, lastGenerated, generatedGames, isGenerating }) => (
    <div className="flex flex-col gap-4 h-full">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700/50">
            <h3 className="text-lg font-bold border-b border-slate-600 pb-2 mb-4">Geração de Jogos</h3>
            
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CheckboxOption
                        id="avoid-existing-mobile"
                        label="Evitar existentes"
                        checked={options.avoidExistingGames}
                        onChange={(checked) => setOptions(o => ({...o, avoidExistingGames: checked}))}
                    />
                    <CheckboxOption
                        id="avoid-sequences-mobile"
                        label="Evitar sequências"
                        checked={options.avoidSequences}
                        onChange={(checked) => setOptions(o => ({...o, avoidSequences: checked}))}
                    />
                </div>
                
                <SliderOption
                    id="min-node-mobile"
                    label={`Força mínima do nó: ${options.minNodeStrength.toFixed(2)}`}
                    value={options.minNodeStrength}
                    onChange={(value) => setOptions(o => ({...o, minNodeStrength: value}))}
                />
                
                <GenerateButton onClick={handleGenerate} isGenerating={isGenerating} />
                
                {lastGenerated && (
                    <GeneratedGameCard game={lastGenerated} onSave={handleSave} />
                )}
            </div>
        </div>
        
        <SavedGamesSection
            generatedGames={generatedGames}
            onDelete={handleDelete}
            onExport={handleExportGames}
            compact={true}
        />
    </div>
);

const DesktopGenerator: React.FC<{
    options: GenerationOptions;
    setOptions: React.Dispatch<React.SetStateAction<GenerationOptions>>;
    handleGenerate: () => void;
    handleSave: () => void;
    handleDelete: (index: number) => void;
    handleExportGames: () => void;
    lastGenerated: Game | null;
    generatedGames: Game[];
    isGenerating: boolean;
}> = ({ options, setOptions, handleGenerate, handleSave, handleDelete, handleExportGames, lastGenerated, generatedGames, isGenerating }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-lg flex flex-col gap-6 border border-slate-700/50">
            <h3 className="text-xl font-bold border-b border-slate-600 pb-2">Opções de Geração</h3>
            
            <CheckboxOption
                id="avoid-existing"
                label="Evitar jogos existentes"
                checked={options.avoidExistingGames}
                onChange={(checked) => setOptions(o => ({...o, avoidExistingGames: checked}))}
            />
            
            <CheckboxOption
                id="avoid-sequences"
                label="Evitar sequências de 3+"
                checked={options.avoidSequences}
                onChange={(checked) => setOptions(o => ({...o, avoidSequences: checked}))}
            />
            
            <SliderOption
                id="min-node"
                label={`Força mínima do nó: ${options.minNodeStrength.toFixed(2)}`}
                value={options.minNodeStrength}
                onChange={(value) => setOptions(o => ({...o, minNodeStrength: value}))}
            />
            
            <SliderOption
                id="min-edge"
                label={`Força mínima da aresta: ${options.minEdgeStrength.toFixed(2)}`}
                value={options.minEdgeStrength}
                onChange={(value) => setOptions(o => ({...o, minEdgeStrength: value}))}
            />
            
            <GenerateButton onClick={handleGenerate} isGenerating={isGenerating} large />
            
            {lastGenerated && (
                <GeneratedGameCard game={lastGenerated} onSave={handleSave} />
            )}
            
            {!lastGenerated && generatedGames.length === 0 && (
                 <p className="text-slate-400 text-center">Nenhum jogo gerado ainda. Clique no botão acima para começar!</p>
            )}
        </div>
        
        <SavedGamesSection
            generatedGames={generatedGames}
            onDelete={handleDelete}
            onExport={handleExportGames}
            className="lg:col-span-2"
        />
    </div>
);

// Componentes auxiliares
const CheckboxOption: React.FC<{
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ id, label, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm">{label}</label>
        <input 
            type="checkbox" 
            id={id} 
            className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 bg-slate-700 border-slate-500 rounded text-cyan-500 focus:ring-cyan-500" 
            checked={checked} 
            onChange={e => onChange(e.target.checked)}
        />
    </div>
);

const SliderOption: React.FC<{
    id: string;
    label: string;
    value: number;
    onChange: (value: number) => void;
}> = ({ id, label, value, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm mb-2">{label}</label>
        <input 
            type="range" 
            id={id} 
            min="0" 
            max="1" 
            step="0.05" 
            value={value} 
            onChange={e => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

const GenerateButton: React.FC<{
    onClick: () => void;
    isGenerating: boolean;
    large?: boolean;
}> = ({ onClick, isGenerating, large = false }) => (
    <button 
        onClick={onClick} 
        disabled={isGenerating}
        className={`w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors ${
            large ? 'py-3 px-4 text-lg' : 'py-2 px-4'
        }`}
    >
        {isGenerating ? (
            <>
                <LoadingSpinner size="sm" />
                Gerando...
            </>
        ) : (
            <>
                <WandIcon className={large ? "w-6 h-6" : "w-5 h-5"} /> 
                Gerar Novo Jogo
            </>
        )}
    </button>
);

const GeneratedGameCard: React.FC<{
    game: Game;
    onSave: () => void;
}> = ({ game, onSave }) => (
    <div className="bg-slate-700 p-4 rounded-lg text-center border border-slate-600/50">
        <h4 className="font-bold mb-3">Jogo Gerado:</h4>
        <div className="grid grid-cols-5 gap-2 mb-4">
           {[...game].sort((a, b) => a - b).map(num => (
               <div key={num} className="bg-cyan-400 text-slate-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                   {num}
               </div>
           ))}
        </div>
        <button 
            onClick={onSave} 
            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-md transition-colors"
        >
            Salvar Jogo
        </button>
    </div>
);

const SavedGamesSection: React.FC<{
    generatedGames: Game[];
    onDelete: (index: number) => void;
    onExport: () => void;
    className?: string;
    compact?: boolean;
}> = ({ generatedGames, onDelete, onExport, className = "", compact = false }) => (
    <div className={`bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700/50 ${compact ? 'flex-1 min-h-0' : ''} ${className}`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold ${compact ? 'text-lg' : 'text-xl'}`}>
                Jogos Salvos ({generatedGames.length})
            </h3>
            {generatedGames.length > 0 && (
                <button 
                    onClick={onExport}
                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
                >
                    <UploadIcon className="w-4 h-4" />
                    Exportar CSV
                </button>
            )}
        </div>
        
        <div className={`space-y-2 sm:space-y-3 overflow-y-auto pr-2 ${compact ? 'max-h-96' : 'max-h-[70vh]'}`}>
            {generatedGames.map((game, index) => (
                <div key={index} className="bg-slate-700 p-3 rounded-lg flex items-center justify-between border border-slate-600/30">
                    {/* Layout HORIZONTAL otimizado para economia de espaço */}
                    <div className="flex flex-wrap gap-1 flex-1">
                       {[...game].sort((a, b) => a - b).map(num => (
                           <span key={num} className="bg-slate-600 text-slate-200 rounded-full w-7 h-7 flex items-center justify-center font-medium text-xs">
                               {num}
                           </span>
                       ))}
                    </div>
                    <button 
                        onClick={() => onDelete(index)} 
                        className="text-slate-400 hover:text-red-400 transition-colors ml-3 p-1 hover:bg-red-500/10 rounded"
                        title="Excluir jogo"
                    >
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                </div>
            ))}  
            {generatedGames.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                        <WandIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400">Seus jogos salvos aparecerão aqui.</p>
                    <p className="text-slate-500 text-sm mt-1">Gere um jogo usando as opções ao lado.</p>
                </div>
            )}
        </div>
    </div>
);
