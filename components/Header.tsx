import React from 'react';
import { ChartBarIcon, WandIcon, UploadIcon, TrashIcon, TableIcon } from './UI/Icons';

interface HeaderProps {
    activeSection: string;
    setActiveSection: (section: 'dashboard' | 'generator' | 'data') => void;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    clearData: () => void;
    gameCount: number;
    isMobile: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
    activeSection, 
    setActiveSection, 
    handleFileUpload, 
    clearData, 
    gameCount, 
    isMobile 
}) => (
    <header className="flex flex-col gap-4">
        {/* Título e contador */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">Analisador de Loteria</h1>
                {gameCount > 0 && (
                    <p className="text-sm text-slate-400 mt-1">{gameCount} jogos carregados</p>
                )}
            </div>
            
            {/* Botões de ação */}
            <div className="flex items-center gap-2">
                <label htmlFor="csv-upload" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-3 sm:px-4 rounded-lg inline-flex items-center gap-2 transition-colors text-sm sm:text-base">
                    <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    {isMobile ? 'CSV' : 'Carregar CSV'}
                </label>
                <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                
                {gameCount > 0 && (
                    <button 
                        onClick={clearData}
                        className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-3 sm:px-4 rounded-lg inline-flex items-center gap-2 transition-colors text-sm sm:text-base"
                        title="Limpar todos os dados"
                    >
                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        {isMobile ? '' : 'Limpar'}
                    </button>
                )}
            </div>
        </div>
        
        {/* Navegação */}
        <div className="flex items-center justify-center">
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg overflow-x-auto">
                <button 
                    onClick={() => setActiveSection('dashboard')} 
                    className={`px-3 py-2 sm:px-4 rounded-md flex items-center gap-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                        activeSection === 'dashboard' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'
                    }`}
                >
                    <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5"/> 
                    Dashboard
                </button>
                <button 
                    onClick={() => setActiveSection('data')} 
                    className={`px-3 py-2 sm:px-4 rounded-md flex items-center gap-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                        activeSection === 'data' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'
                    }`}
                >
                    <TableIcon className="w-4 h-4 sm:w-5 sm:h-5"/> 
                    Dados
                </button>
                <button 
                    onClick={() => setActiveSection('generator')} 
                    className={`px-3 py-2 sm:px-4 rounded-md flex items-center gap-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                        activeSection === 'generator' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'
                    }`}
                >
                    <WandIcon className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    Gerador
                </button>
            </div>
        </div>
    </header>
);
