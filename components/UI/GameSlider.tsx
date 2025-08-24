import React, { useState, useEffect, useCallback } from 'react';

interface GameSliderProps {
  totalGames: number;
  currentGames: number;
  onGameCountChange: (gameCount: number) => void;
  className?: string;
}

export const GameSlider: React.FC<GameSliderProps> = ({
  totalGames,
  currentGames,
  onGameCountChange,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000); // 1 segundo por padrão

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    onGameCountChange(value);
  };

  // Lógica do player automático
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentGameCount(prev => {
        if (prev >= totalGames) {
          setIsPlaying(false); // Para automaticamente no final
          return totalGames;
        }
        const nextValue = prev + 1;
        onGameCountChange(nextValue);
        return nextValue;
      });
    }, playSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, totalGames, onGameCountChange]);

  // Função para iniciar/pausar o player
  const togglePlay = useCallback(() => {
    if (currentGames >= totalGames) {
      // Se está no final, reinicia do início
      onGameCountChange(1);
    }
    setIsPlaying(prev => !prev);
  }, [currentGames, totalGames, onGameCountChange]);

  // Função para parar e voltar ao início
  const stopPlayer = useCallback(() => {
    setIsPlaying(false);
    onGameCountChange(1);
  }, [onGameCountChange]);

  // Estado para controle interno
  const [currentGameCount, setCurrentGameCount] = useState(currentGames);

  useEffect(() => {
    setCurrentGameCount(currentGames);
  }, [currentGames]);

  const percentage = totalGames > 0 ? (currentGames / totalGames) * 100 : 0;

  return (
    <div className={`game-slider-container ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-300">
          Resultados analisados:
        </label>
        <div className="text-sm text-cyan-400 font-semibold">
          {currentGames} / {totalGames} ({percentage.toFixed(1)}%)
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="1"
          max={totalGames}
          value={currentGames}
          onChange={handleSliderChange}
          className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${percentage}%, #374151 ${percentage}%, #374151 100%)`
          }}
          disabled={isPlaying} // Desabilita quando está tocando
        />
        
        {/* Marcadores visuais */}
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>1</span>
          <span>{Math.floor(totalGames / 4)}</span>
          <span>{Math.floor(totalGames / 2)}</span>
          <span>{Math.floor(3 * totalGames / 4)}</span>
          <span>{totalGames}</span>
        </div>
      </div>

      {/* NOVO: Controles do Player Automático */}
      <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-200">
            🎬 Player Automático
          </h4>
          <div className="flex items-center gap-1">
            {isPlaying ? (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            )}
            <span className="text-xs text-slate-400">
              {isPlaying ? 'Rodando' : 'Parado'}
            </span>
          </div>
        </div>

        {/* Controles de Play/Pause/Stop */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={togglePlay}
            className={`flex-1 px-3 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isPlaying
                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4h2v12H5V4zm8 0h2v12h-2V4z"/>
                </svg>
                Pausar
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
                </svg>
                {currentGames >= totalGames ? 'Reiniciar' : 'Play'}
              </>
            )}
          </button>

          <button
            onClick={stopPlayer}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-1"
            disabled={!isPlaying && currentGames === 1}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4h12v12H4V4z"/>
            </svg>
            Stop
          </button>
        </div>

        {/* Controle de Velocidade */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-300">Velocidade:</label>
            <span className="text-xs text-cyan-400">
              {playSpeed === 3000 ? '0.5x' : 
               playSpeed === 2000 ? '0.75x' :
               playSpeed === 1000 ? '1x' :
               playSpeed === 500 ? '2x' : '4x'}
            </span>
          </div>
          <div className="flex gap-1">
            {[
              { speed: 3000, label: '0.5x', desc: '3s' },
              { speed: 2000, label: '0.75x', desc: '2s' },
              { speed: 1000, label: '1x', desc: '1s' },
              { speed: 500, label: '2x', desc: '0.5s' },
              { speed: 250, label: '4x', desc: '0.25s' }
            ].map(({ speed, label, desc }) => (
              <button
                key={speed}
                onClick={() => setPlaySpeed(speed)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  playSpeed === speed
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                }`}
                title={`${label} (${desc} por jogo)`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar do Player */}
        {isPlaying && (
          <div className="mb-2">
            <div className="w-full bg-slate-600 rounded-full h-1.5">
              <div 
                className="bg-green-400 h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Descrição */}
        <p className="text-xs text-slate-400 text-center">
          {isPlaying ? 
            `Assistindo a evolução dos padrões... (${totalGames - currentGames} jogos restantes)` :
            'Veja como os padrões evoluem conforme mais jogos são analisados'
          }
        </p>
      </div>
      
      {/* Botões de controle rápido */}
      <div className="flex gap-2 mt-3 justify-center">
        <button
          onClick={() => onGameCountChange(1)}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          disabled={isPlaying}
        >
          Início
        </button>
        <button
          onClick={() => onGameCountChange(Math.floor(totalGames / 4))}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          disabled={isPlaying}
        >
          25%
        </button>
        <button
          onClick={() => onGameCountChange(Math.floor(totalGames / 2))}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          disabled={isPlaying}
        >
          50%
        </button>
        <button
          onClick={() => onGameCountChange(Math.floor(3 * totalGames / 4))}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          disabled={isPlaying}
        >
          75%
        </button>
        <button
          onClick={() => onGameCountChange(totalGames)}
          className="px-2 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
          disabled={isPlaying}
        >
          Todos
        </button>
      </div>
      
      {/* Info adicional */}
      <div className="text-xs text-slate-400 text-center mt-2">
        {isPlaying ? 
          'Player automático ativo - visualização em tempo real' :
          'Arraste o slider ou use o player para ver a evolução dos padrões'
        }
      </div>
      
      {/* CSS do slider */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${isPlaying ? '#10b981' : '#06b6d4'};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: background 0.2s;
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${isPlaying ? '#10b981' : '#06b6d4'};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: background 0.2s;
        }

        .slider-thumb:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};