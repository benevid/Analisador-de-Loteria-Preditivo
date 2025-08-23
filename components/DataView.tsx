import React, { useState } from 'react';
import type { Game } from '../types';

interface DataViewProps {
  games: Game[];
}

const ITEMS_PER_PAGE = 20;

export const DataView: React.FC<DataViewProps> = ({ games }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(games.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedGames = games.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (games.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-800 rounded-lg">
        <h3 className="text-xl font-bold">Nenhum Jogo Carregado</h3>
        <p className="text-slate-400">Carregue um arquivo CSV para ver os dados aqui.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400 border-b border-slate-600 pb-2">
        Resultados Carregados ({games.length} total)
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-4 py-2 rounded-tl-lg">Concurso #</th>
              <th className="px-4 py-2 rounded-tr-lg">Dezenas Sorteadas</th>
            </tr>
          </thead>
          <tbody>
            {paginatedGames.map((game, index) => (
              <tr key={startIndex + index} className="border-b border-slate-700 last:border-b-0 hover:bg-slate-700/30">
                <td className="px-4 py-3 font-medium text-slate-400">{startIndex + index + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {[...game].sort((a,b) => a-b).map(num => (
                      <span key={num} className="bg-slate-600 text-slate-200 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                        {num}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
            <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Anterior
            </button>
            <span className="text-slate-400">
                Página {currentPage} de {totalPages}
            </span>
            <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Próximo
            </button>
        </div>
      )}
    </div>
  );
};
