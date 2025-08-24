import React, { useState, useEffect, useRef } from 'react';
import type { AnalysisResult, ChatMessage } from '../types';
import { sendMessageToAI } from '../services/aiService';


// --- Icons ---
const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


interface AiAssistantProps {
    analysis: AnalysisResult | null;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ analysis }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if(isOpen && messages.length === 0){
             setMessages([{ sender: 'ai', text: 'Olá! Como posso ajudar a analisar os dados da loteria hoje?' }]);
        }
    }, [isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponseText = await sendMessageToAI(input, analysis);
            const aiMessage: ChatMessage = { sender: 'ai', text: aiResponseText };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { sender: 'ai', text: 'Desculpe, não consegui me conectar ao assistente. Tente novamente.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={`fixed bottom-20 right-4 md:right-6 lg:right-8 z-40 w-[calc(100%-2rem)] max-w-md bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-t-lg">
                    <h3 className="font-bold text-lg flex items-center gap-2"><BotIcon className="text-cyan-400" /> Assistente IA</h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><CloseIcon /></button>
                </div>
                <div className="h-96 overflow-y-auto p-4 flex flex-col gap-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                             {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-cyan-400"/></div>}
                             <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-700'}`}>
                                {msg.text}
                             </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-cyan-400"/></div>
                             <div className="max-w-xs md:max-w-sm rounded-lg px-4 py-2 bg-slate-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-0"></span>
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300"></span>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={analysis ? "Pergunte sobre os dados..." : "Carregue os dados para começar"}
                        disabled={!analysis || isLoading}
                        className="flex-grow bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:cursor-not-allowed"
                        aria-label="Chat input"
                    />
                    <button type="submit" disabled={!analysis || isLoading} className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed p-2 rounded-md transition-colors">
                        <SendIcon className="w-5 h-5 text-white" />
                    </button>
                </form>
            </div>
            
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 md:right-6 lg:right-8 z-50 w-14 h-14 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                aria-label="Abrir assistente de IA"
            >
                <BotIcon className="w-7 h-7" />
            </button>
        </>
    );
};
