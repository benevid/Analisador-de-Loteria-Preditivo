import Papa from 'papaparse';
import type { Game, AnalysisResult, GenerationOptions, Node, Edge } from '../types';

const LOTTERY_NUMBERS = Array.from({ length: 25 }, (_, i) => i + 1);
const GAME_SIZE = 15;

const gameToString = (game: Game): string => {
  return [...game].sort((a, b) => a - b).join(',');
};

export const parseAndMergeGames = (
  csvString: string,
  existingGames: Game[]
): Promise<Game[]> => {
  return new Promise((resolve, reject) => {
    const existingGameStrings = new Set(existingGames.map(gameToString));

    Papa.parse(csvString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimiter: ';',
      complete: (results) => {
        try {
          const newGames: Game[] = [];
          (results.data as any[]).forEach(row => {
            const game: number[] = [];
            let isValidRow = true;
            for(let i = 1; i <= GAME_SIZE; i++) {
                const ballValue = row[`Bola${i}`];
                 if (typeof ballValue === 'number' && ballValue >= 1 && ballValue <= 25) {
                    game.push(ballValue);
                } else {
                    isValidRow = false;
                    break;
                }
            }

            if (isValidRow && game.length === GAME_SIZE) {
               const gameStr = gameToString(game);
               if (!existingGameStrings.has(gameStr)) {
                   newGames.push(game);
                   existingGameStrings.add(gameStr);
               }
            }
          });
          resolve([...existingGames, ...newGames]);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};

export const analyzeGames = (games: Game[]): AnalysisResult | null => {
  if (games.length === 0) return null;

  const nodeFrequencies: Map<number, number> = new Map();
  const edgeFrequencies: Map<string, number> = new Map();

  LOTTERY_NUMBERS.forEach(num => nodeFrequencies.set(num, 0));

  for (const game of games) {
    const sortedGame = [...game].sort((a, b) => a - b);
    for (const num of sortedGame) {
      nodeFrequencies.set(num, (nodeFrequencies.get(num) || 0) + 1);
    }
    // Generate edges for adjacent pairs in the sorted game
    for (let i = 0; i < sortedGame.length - 1; i++) {
        const source = sortedGame[i];
        const target = sortedGame[i+1];
        const key = `${source}-${target}`;
        edgeFrequencies.set(key, (edgeFrequencies.get(key) || 0) + 1);
    }
  }

  const nodeValues = Array.from(nodeFrequencies.values());
  const minNodeFrequency = Math.min(...nodeValues);
  const maxNodeFrequency = Math.max(...nodeValues);

  const nodes: Node[] = LOTTERY_NUMBERS.map(id => {
    const frequency = nodeFrequencies.get(id)!;
    const normalizedFrequency = maxNodeFrequency === minNodeFrequency ? 1 : (frequency - minNodeFrequency) / (maxNodeFrequency - minNodeFrequency);
    return { id, frequency, normalizedFrequency };
  });

  const edgeValues = Array.from(edgeFrequencies.values());
  const minEdgeFrequency = edgeValues.length > 0 ? Math.min(...edgeValues) : 0;
  const maxEdgeFrequency = edgeValues.length > 0 ? Math.max(...edgeValues) : 1;

  const edges: Edge[] = Array.from(edgeFrequencies.entries()).map(([key, frequency]) => {
    const [source, target] = key.split('-').map(Number);
    const normalizedFrequency = maxEdgeFrequency === minEdgeFrequency ? 1 : (frequency - minEdgeFrequency) / (maxEdgeFrequency - minEdgeFrequency);
    return { source, target, frequency, normalizedFrequency };
  });

  return {
    nodes,
    edges,
    totalGames: games.length,
    minNodeFrequency,
    maxNodeFrequency,
    minEdgeFrequency,
    maxEdgeFrequency
  };
};

export const generateGame = (
    analysis: AnalysisResult,
    options: GenerationOptions,
    existingGames: Game[]
): Game | null => {
    const { nodes, edges } = analysis;
    const existingGameStrings = new Set(existingGames.map(gameToString));

    const eligibleNodes = nodes.filter(n => n.normalizedFrequency >= options.minNodeStrength);
    if (eligibleNodes.length < GAME_SIZE) return null; // Not enough nodes to form a game

    const nodeWeights = new Map(eligibleNodes.map(n => [n.id, Math.pow(n.frequency, 2)]));
    const totalNodeWeight = Array.from(nodeWeights.values()).reduce((sum, weight) => sum + weight, 0);

    const edgeMap = new Map<number, { target: number; weight: number }[]>();
    edges
      .filter(e => e.normalizedFrequency >= options.minEdgeStrength)
      .forEach(e => {
        const weight = Math.pow(e.frequency, 2);
        if (!edgeMap.has(e.source)) edgeMap.set(e.source, []);
        edgeMap.get(e.source)!.push({ target: e.target, weight });
    });
    
    for (let attempt = 0; attempt < 100; attempt++) {
        const newGame: number[] = [];
        
        // Pick start node
        let random = Math.random() * totalNodeWeight;
        let startNode: number | undefined;
        for(const [id, weight] of nodeWeights.entries()){
            random -= weight;
            if(random <= 0) {
                startNode = id;
                break;
            }
        }
        if(!startNode) startNode = eligibleNodes[eligibleNodes.length-1].id;

        newGame.push(startNode);
        
        while (newGame.length < GAME_SIZE) {
            const lastNum = newGame[newGame.length-1];
            const possibleNext = edgeMap.get(lastNum)?.filter(e => !newGame.includes(e.target) && nodeWeights.has(e.target));

            let nextNum: number | undefined;
            if(possibleNext && possibleNext.length > 0) {
                const totalEdgeWeight = possibleNext.reduce((sum, e) => sum + e.weight, 0);
                let randomEdge = Math.random() * totalEdgeWeight;
                for(const edge of possibleNext) {
                    randomEdge -= edge.weight;
                    if(randomEdge <= 0) {
                        nextNum = edge.target;
                        break;
                    }
                }
            }
            
            // If no valid edge or fell through, pick a random eligible node
            if(!nextNum) {
                const availableNodes = eligibleNodes.filter(n => !newGame.includes(n.id));
                if(availableNodes.length === 0) break; // No more numbers to pick
                nextNum = availableNodes[Math.floor(Math.random() * availableNodes.length)].id;
            }
            newGame.push(nextNum);
        }

        if (newGame.length !== GAME_SIZE) continue;

        const sortedGame = [...newGame].sort((a,b) => a - b);

        if (options.avoidSequences) {
            let hasSequence = false;
            for (let i = 0; i < sortedGame.length - 2; i++) {
                if (sortedGame[i+1] === sortedGame[i] + 1 && sortedGame[i+2] === sortedGame[i] + 2) {
                    hasSequence = true;
                    break;
                }
            }
            if (hasSequence) continue;
        }

        if (options.avoidExistingGames) {
            if (existingGameStrings.has(gameToString(sortedGame))) {
                continue;
            }
        }

        return sortedGame;
    }

    return null; // Failed to generate a valid game after 100 attempts
};