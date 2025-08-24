import React from 'react';
import { ChartBarIcon } from './UI/Icons';

interface EmptyStateProps {
    title: string;
    description: string;
    subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, subtitle }) => (
    <div className="flex-grow flex items-center justify-center text-center p-8">
        <div className="max-w-md">
           <div className="w-24 h-24 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
               <ChartBarIcon className="w-12 h-12 text-slate-400" />
           </div>
           <h2 className="text-2xl font-bold mb-4">{title}</h2>
           <p className="text-slate-400 mb-6">{description}</p>
           {subtitle && (
               <div className="text-sm text-slate-500">
                   <p>Formato esperado: Bola1, Bola2, ..., Bola15</p>
                   <p>Números de 1 a 25, separados por ponto e vírgula</p>
               </div>
           )}
        </div>
    </div>
);

interface LoadingStateProps {
    message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => (
    <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <div className="text-xl">{message}</div>
        </div>
    </div>
);
