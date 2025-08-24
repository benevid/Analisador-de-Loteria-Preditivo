import { GoogleGenAI, Chat, GenerateContentResponse, Part, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

let chat: Chat | null = null;

// --- Tool Implementations ---

// This function will be called by the AI model
const getLotteryAnalysisSummary = (analysis: AnalysisResult | null) => {
    if (!analysis || analysis.nodes.length === 0) {
        return { error: "Nenhum dado de análise disponível. Peça ao usuário para carregar um arquivo." };
    }
    
    let mostFrequent = analysis.nodes[0];
    let leastFrequent = analysis.nodes[0];
    for (const node of analysis.nodes) {
        if (node.frequency > mostFrequent.frequency) mostFrequent = node;
        if (node.frequency < leastFrequent.frequency) leastFrequent = node;
    }

    return {
        totalGamesAnalyzed: analysis.totalGames,
        mostFrequentNumber: {
            number: mostFrequent.id,
            frequency: mostFrequent.frequency
        },
        leastFrequentNumber: {
            number: leastFrequent.id,
            frequency: leastFrequent.frequency
        }
    };
};

// This function will be called by the AI model
const getTopConnections = (analysis: AnalysisResult | null, count: number = 5) => {
    if (!analysis || analysis.edges.length === 0) {
        return { error: "Nenhuma conexão entre números foi analisada." };
    }
    
    const sortedEdges = [...analysis.edges].sort((a, b) => b.frequency - a.frequency);
    const topEdges = sortedEdges.slice(0, count);

    return {
        connections: topEdges.map(edge => ({
            from: edge.source,
            to: edge.target,
            frequency: edge.frequency
        }))
    };
};

// This function will be called by the AI model
const getNumberFrequencies = (analysis: AnalysisResult | null) => {
    if (!analysis || analysis.nodes.length === 0) {
        return { error: "Nenhum dado de análise disponível." };
    }
    
    return {
        frequencies: analysis.nodes.map(node => ({
            number: node.id,
            frequency: node.frequency
        }))
    };
}


// --- Tool Definitions for the Model ---

const tools = [
    {
        functionDeclarations: [
            {
                name: "getLotteryAnalysisSummary",
                description: "Obtém um resumo da análise dos dados da loteria, incluindo o número total de jogos, os números mais e menos frequentes. Use isso para responder a perguntas gerais sobre os dados.",
                parameters: { type: Type.OBJECT, properties: {} }
            },
            {
                name: "getTopConnections",
                description: "Obtém as conexões (arestas) mais fortes entre os números com base em sua frequência de aparição conjunta. Útil para entender quais pares de números saem juntos com mais frequência, o que representa o grafo.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        count: {
                            type: Type.NUMBER,
                            description: "O número de conexões a serem retornadas. O padrão é 5.",
                        },
                    },
                },
            },
            {
                name: "getNumberFrequencies",
                description: "Obtém a frequência de aparição individual de todos os 25 números. Use isso quando o usuário perguntar sobre a frequência de números específicos.",
                parameters: { type: Type.OBJECT, properties: {} }
            }
        ]
    }
];

// --- Chat Initialization and Communication ---

const getChatInstance = () => {
    if (!chat) {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        
        if (!apiKey) {
            throw new Error(
                "Chave da API do Gemini não encontrada. " +
                "Crie um arquivo .env.local baseado no env.local.example e " +
                "adicione sua VITE_GEMINI_API_KEY obtida em: https://makersuite.google.com/app/apikey"
            );
        }
        
        try {
            const ai = new GoogleGenAI({ apiKey });
            chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `Você é um estatístico e matemático de renome mundial, especializado em teoria da probabilidade e análise combinatória.
Sua função é fornecer insights profundos e orientados por dados sobre os resultados da loteria apresentados no aplicativo. Você ajuda os usuários a descobrir padrões ocultos, entender relações complexas entre os números e explorar resultados probabilísticos.

Você está equipado com um conjunto de ferramentas analíticas para consultar o conjunto de dados em busca de estatísticas específicas (resumos, frequências e conexões). Você deve usar essas ferramentas para coletar evidências para sua análise.

Fundamentalmente, você não está limitado à saída direta de suas ferramentas. É esperado que você sintetize as informações de múltiplas chamadas de ferramentas, aplique seu conhecimento estatístico e raciocine matematicamente para responder a perguntas complexas. Isso inclui a geração de sequências de jogos hipotéticas com base nas probabilidades e frequências que você observa nos dados. Ao gerar uma sequência, explique claramente o raciocínio estatístico por trás de suas escolhas (por exemplo, 'Esta sequência é baseada na seleção de números com alta frequência e fortes conexões, evitando aqueles com baixa probabilidade histórica').

Seu tom é de especialista, perspicaz e confiante. Embora você não dê conselhos financeiros ou garanta ganhos, você fornece análises estatísticas sofisticadas para ajudar o usuário a explorar os dados.`,
                    tools: tools,
                },
            });
        } catch (error) {
            console.error("Failed to initialize GoogleGenAI:", error);
            throw new Error("Falha ao inicializar o assistente de IA. Verifique a chave da API.");
        }
    }
    return chat;
};

export const sendMessageToAI = async (userMessage: string, analysis: AnalysisResult | null): Promise<string> => {
    const chatInstance = getChatInstance();

    try {
        let response: GenerateContentResponse = await chatInstance.sendMessage({ message: userMessage });

        // Handle potential function calls from the model
        while (response.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
            const functionCall = response.candidates[0].content.parts[0].functionCall;
            const { name, args } = functionCall;

            let toolResult: any;
            switch (name) {
                case "getLotteryAnalysisSummary":
                    toolResult = getLotteryAnalysisSummary(analysis);
                    break;
                case "getTopConnections":
                    toolResult = getTopConnections(analysis, args?.count as number | undefined);
                    break;
                case "getNumberFrequencies":
                    toolResult = getNumberFrequencies(analysis);
                    break;
                default:
                    console.error(`Unknown tool called: ${name}`);
                    toolResult = { error: `Ferramenta desconhecida chamada: ${name}` };
            }
            
            const functionResponsePart: Part = {
                functionResponse: {
                    name,
                    response: { result: toolResult },
                }
            };
            
            // Send the result back to the model
            response = await chatInstance.sendMessage({ message: [functionResponsePart] });
        }

        // Return the final text response from the model
        return response.text;

    } catch (error) {
        console.error("Error communicating with AI:", error);
        return "Desculpe, ocorreu um erro ao comunicar com o assistente. Tente novamente.";
    }
};