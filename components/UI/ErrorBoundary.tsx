import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: string;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
            errorInfo: error.stack
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        // Log específico para erros WebGL
        if (error.message.includes('WebGL') || error.message.includes('Context')) {
            console.warn('WebGL Context error detected:', error.message);
        }
    }

    reset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            const { fallback: Fallback } = this.props;
            
            if (Fallback) {
                return <Fallback error={this.state.error} reset={this.reset} />;
            }

            return (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-lg">
                    <div className="text-center text-white p-6 max-w-md">
                        <div className="text-red-400 text-xl mb-3">⚠️ Erro de Renderização</div>
                        <div className="text-sm text-slate-300 mb-4">
                            {this.state.error?.message?.includes('WebGL') || this.state.error?.message?.includes('Context')
                                ? 'Erro no WebGL. Sua placa gráfica pode não suportar esta visualização.'
                                : 'Ocorreu um erro inesperado na renderização 3D.'
                            }
                        </div>
                        <div className="flex gap-2 justify-center">
                            <button 
                                onClick={this.reset}
                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-sm transition-colors"
                            >
                                Tentar Novamente
                            </button>
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded text-sm transition-colors"
                            >
                                Recarregar Página
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-slate-400 text-xs">
                                    Detalhes do erro (dev)
                                </summary>
                                <pre className="text-xs text-red-300 mt-2 overflow-auto max-h-32">
                                    {this.state.error?.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Componente de fallback específico para ThreeScene
export const ThreeSceneFallback: React.FC<{ error?: Error; reset: () => void }> = ({ error, reset }) => {
    const isWebGLError = error?.message?.includes('WebGL') || error?.message?.includes('Context');

    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-lg">
            <div className="text-center text-white p-6 max-w-md">
                <div className="text-yellow-400 text-4xl mb-4">🎯</div>
                <div className="text-cyan-400 font-semibold mb-2">
                    Visualização 3D Indisponível
                </div>
                <div className="text-sm text-slate-300 mb-4">
                    {isWebGLError 
                        ? 'Sua placa gráfica não suporta WebGL ou o contexto foi perdido.'
                        : 'Ocorreu um erro na renderização 3D.'
                    }
                </div>
                <div className="text-xs text-slate-400 mb-4">
                    Tente usar as outras visualizações: Mapa de Calor, Matriz 2D ou Histograma.
                </div>
                <div className="flex gap-2 justify-center">
                    <button 
                        onClick={reset}
                        className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-sm transition-colors"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    );
};
