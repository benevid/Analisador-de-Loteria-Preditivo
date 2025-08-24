import React, { useState, useEffect, useCallback } from 'react';
import type { Game, AnalysisResult } from './types';
import { parseAndMergeGames, analyzeGames } from './services/lotteryService';

// Componentes modulares
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { NumberGenerator } from './components/NumberGenerator';
import { DataView } from './components/DataView';
import { AiAssistant } from './components/AiAssistant';
import { EmptyState, LoadingState } from './components/LoadingStates';
import { NotificationContainer, Notification } from './components/UI/Notification';

const App: React.FC = () => {
    // Estado principal
    const [games, setGames] = useState<Game[]>([]);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [generatedGames, setGeneratedGames] = useState<Game[]>([]);
    const [activeSection, setActiveSection] = useState<'dashboard' | 'generator' | 'data'>('dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Detectar dispositivo mobile e redimensionamento
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        const handleResize = () => {
            checkMobile();
            // Limpar contextos WebGL perdidos ao redimensionar
            if (window.performance && window.performance.mark) {
                window.performance.mark('resize-start');
            }
        };
        
        checkMobile();
        window.addEventListener('resize', handleResize);
        
        // Cleanup WebGL contexts on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Auto-clear notifications
    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    // Análise de dados otimizada com debounce
    useEffect(() => {
        if (games.length > 0) {
            setIsLoading(true);
            
            // Debounce para múltiplas atualizações
            const timer = setTimeout(() => {
                try {
                    const newAnalysis = analyzeGames(games);
                    setAnalysis(newAnalysis);
                } catch (err) {
                    setError('Erro ao analisar os dados. Por favor, tente novamente.');
                    console.error('Erro na análise:', err);
                } finally {
                    setIsLoading(false);
                }
            }, 300);
            
            return () => clearTimeout(timer);
        } else {
            setAnalysis(null);
        }
    }, [games]);

    // Handlers otimizados
    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setError('Por favor, selecione um arquivo CSV válido.');
            event.target.value = '';
            return;
        }

        // Validar tamanho do arquivo (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Arquivo muito grande. O tamanho máximo é 10MB.');
            event.target.value = '';
            return;
        }

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
                
                // Analytics
                if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'file_upload', {
                        games_added: numAdded,
                        total_games: updatedGames.length
                    });
                }
            } else {
                setIsLoading(false);
                setSuccessMessage('Nenhum jogo novo encontrado ou os jogos do arquivo já existem na base de dados.');
            }
        } catch (err) {
            setError('Falha ao processar o arquivo CSV. Verifique o formato e se os números estão entre 1 e 25.');
            console.error('Erro no upload:', err);
            setIsLoading(false);
        } finally {
            event.target.value = '';
        }
    }, [games]);

    const clearData = useCallback(() => {
        if (games.length === 0 && generatedGames.length === 0) {
            setError('Não há dados para limpar.');
            return;
        }

        // Confirmação para grandes quantidades de dados
        if (games.length > 100 || generatedGames.length > 10) {
            const confirmed = window.confirm(
                `Você tem ${games.length} jogos carregados e ${generatedGames.length} jogos gerados. ` +
                'Tem certeza que deseja limpar todos os dados?'
            );
            if (!confirmed) return;
        }

        setGames([]);
        setGeneratedGames([]);
        setAnalysis(null);
        setError(null);
        setSuccessMessage('Dados limpos com sucesso!');
        
        // Analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'data_cleared', {
                games_cleared: games.length,
                generated_cleared: generatedGames.length
            });
        }
    }, [games.length, generatedGames.length]);

    // Preload de componentes lazy para melhor UX
    useEffect(() => {
        if (analysis && !isMobile) {
            // Pre-load do ThreeScene quando análise estiver disponível
            import('./components/ThreeScene');
        }
    }, [analysis, isMobile]);
    
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
            {/* Container principal com padding responsivo */}
            <div className="flex flex-col p-3 sm:p-4 md:p-6 lg:p-8 gap-4 md:gap-6 min-h-screen">
                <Header 
                    activeSection={activeSection} 
                    setActiveSection={setActiveSection} 
                    handleFileUpload={handleFileUpload}
                    clearData={clearData}
                    gameCount={games.length}
                    isMobile={isMobile}
                />
                
                {/* Notifications */}
                <NotificationContainer>
                    {error && <Notification type="error" message={error} onDismiss={() => setError(null)} />}
                    {successMessage && <Notification type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}
                </NotificationContainer>

                <main className="flex-grow flex flex-col min-h-0">
                    {/* Loading State */}
                    {isLoading && <LoadingState message="Analisando dados..." />}
                    
                    {/* Empty State */}
                    {!isLoading && !analysis && (
                        <EmptyState
                            title="Sem Dados para Analisar"
                            description="Por favor, carregue um arquivo CSV com os resultados da loteria para começar."
                            subtitle="format-info"
                        />
                    )}

                    {/* Main Content */}
                    {!isLoading && analysis && (
                        <div className="flex-grow min-h-0">
                            {/* Dashboard */}
                            <div className={`${activeSection === 'dashboard' ? 'h-full' : 'hidden'}`}>
                                <Dashboard analysis={analysis} games={games} isMobile={isMobile} />
                            </div>
                            
                            {/* Data View */}
                            <div className={`${activeSection === 'data' ? 'block' : 'hidden'} h-full`}>
                                <DataView games={games} />
                            </div>
                            
                            {/* Generator */}
                            <div className={`${activeSection === 'generator' ? 'block' : 'hidden'} h-full`}>
                                <NumberGenerator 
                                    analysis={analysis}
                                    existingGames={games}
                                    generatedGames={generatedGames}
                                    setGeneratedGames={setGeneratedGames}
                                    setError={setError}
                                    isMobile={isMobile}
                                />
                            </div>
                        </div>
                    )}
                </main>
                
                {/* AI Assistant - Só mostrar quando há análise */}
                {analysis && <AiAssistant analysis={analysis} />}
            </div>
        </div>
    );
};

export default App;
