import React from 'react';

export interface NotificationProps {
    type: 'success' | 'error';
    message: string;
    onDismiss: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ type, message, onDismiss }) => {
    const baseClasses = 'p-4 rounded-lg mb-4 shadow-lg flex items-center justify-between transition-all duration-300 backdrop-blur-sm pointer-events-auto';
    const typeClasses = {
        success: 'bg-green-500/90 border border-green-400 text-white',
        error: 'bg-red-500/90 border border-red-400 text-white'
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <span className="text-sm md:text-base">{message}</span>
            <button 
                onClick={onDismiss} 
                className="ml-4 opacity-70 hover:opacity-100 text-xl font-bold hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                aria-label="Fechar notificação"
            >
                &times;
            </button>
        </div>
    );
};

export const NotificationContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="fixed top-4 right-4 w-full max-w-sm z-50 pointer-events-none">
        {children}
    </div>
);
