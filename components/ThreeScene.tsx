import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { AnalysisResult, Node as NodeType, Game } from '../types';
import { analyzeGamesSequential } from '../services/lotteryService';

interface ThreeSceneProps {
    analysis: AnalysisResult;
    games: Game[];
    gameCount: number;
    mode: 'graph' | 'interactive';
}

// FORMA 1: Grafo 3D Interativo - Nós destacados por frequência
const Form1GraphNode: React.FC<{
    node: NodeType;
    position: [number, number, number];
    onClick: () => void;
}> = ({ node, position, onClick }) => {
    // Cores e tamanhos baseados na frequência
    const frequency = node.normalizedFrequency;
    const radius = 0.5 + frequency * 0.8; // Maior = mais frequente
    const color = `hsl(${200 + frequency * 120}, 80%, ${50 + frequency * 30}%)`; // Azul -> Verde/Amarelo
    const borderIntensity = 0.3 + frequency * 0.7; // Contorno mais forte
    
    return (
        <group position={position} onClick={onClick}>
            <mesh>
                <sphereGeometry args={[radius, 16, 16]} />
                <meshStandardMaterial 
                    color={color}
                    transparent
                    opacity={0.8}
                    emissive={color}
                    emissiveIntensity={borderIntensity * 0.3}
                />
            </mesh>
            {/* Contorno/Border mais forte para números frequentes */}
            <mesh>
                <sphereGeometry args={[radius + 0.1, 16, 16]} />
                <meshBasicMaterial 
                    color={color}
                    transparent
                    opacity={borderIntensity * 0.4}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
};

// FORMA 3: Interativo - Nó selecionado se afasta + probabilidades
const Form3InteractiveNode: React.FC<{
    node: NodeType;
    basePosition: [number, number, number];
    isSelected: boolean;
    probability?: number;
    onClick: () => void;
}> = ({ node, basePosition, isSelected, probability, onClick }) => {
    // Se selecionado, afasta no eixo Z
    const position: [number, number, number] = isSelected 
        ? [basePosition[0], basePosition[1], basePosition[2] + 5]
        : basePosition;
    
    const frequency = node.normalizedFrequency;
    const radius = isSelected ? 1 : 0.6 + frequency * 0.4;
    const color = isSelected ? "#ff6b35" : `hsl(${180 + frequency * 60}, 70%, ${40 + frequency * 30}%)`;
    
    return (
        <group position={position} onClick={onClick}>
            <mesh>
                <sphereGeometry args={[radius, 16, 16]} />
                <meshStandardMaterial 
                    color={color}
                    transparent
                    opacity={0.8}
                    emissive={color}
                    emissiveIntensity={isSelected ? 0.5 : 0.2}
                />
            </mesh>
            {/* Mostrar probabilidade se disponível */}
            {isSelected && probability !== undefined && (
                <mesh position={[0, 0, 2]}>
                    <planeGeometry args={[2, 0.5]} />
                    <meshBasicMaterial color="black" transparent opacity={0.8} />
                </mesh>
            )}
        </group>
    );
};

export const ThreeScene: React.FC<ThreeSceneProps> = ({ analysis, games, gameCount, mode }) => {
    const [selectedNode, setSelectedNode] = useState<number | null>(null);
    
    // CORREÇÃO PRINCIPAL: Usar análise SEQUENCIAL como a Matrix2DView
    const sequentialAnalysis = useMemo(() => {
        if (games.length === 0) return analysis;
        return analyzeGamesSequential(games, gameCount) || analysis;
    }, [games, gameCount, analysis]);
    
    const { nodes, edges } = sequentialAnalysis;

    console.log('FORMA 3D - ThreeScene SEQUENCIAL - Modo:', mode, 'Nós:', nodes.length, 'Arestas:', edges.length);
    console.log('FORMA 3D - Primeiras 5 arestas sequenciais:', edges.slice(0, 5).map(e => `${e.source}->${e.target} (${e.frequency}x)`));

    // Posições baseadas no modo
    const nodePositions = useMemo(() => {
        const positions = new Map<number, [number, number, number]>();
        
        if (mode === 'interactive') {
            // FORMA 3: Disposição em matriz 2D (5x5) para interatividade
            for (let i = 0; i < 25; i++) {
                const num = i + 1;
                const row = Math.floor(i / 5);
                const col = i % 5;
                const x = (col - 2) * 3; // -6 a +6
                const y = (2 - row) * 3; // +6 a -6
                const z = 0; // Plano inicial
                positions.set(num, [x, y, z]);
            }
        } else {
            // FORMA 1: Disposição circular 3D
            const radius = 10;
            const angleStep = (2 * Math.PI) / nodes.length;
            
            nodes.forEach((node, index) => {
                const angle = index * angleStep;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = (node.normalizedFrequency - 0.5) * 6; // Altura por frequência
                positions.set(node.id, [x, y, z]);
            });
        }
        
        return positions;
    }, [nodes, mode]);

    // CORREÇÃO: Apenas arestas SEQUENCIAIS que existem (não todas as co-ocorrências)
    const relevantEdges = useMemo(() => {
        // Filtrar apenas conexões sequenciais que realmente existem
        const validSequentialEdges = edges.filter(edge => edge.frequency > 0);
        
        if (mode === 'interactive' && selectedNode) {
            // FORMA 3: Apenas conexões sequenciais do nó selecionado
            return validSequentialEdges.filter(edge => 
                edge.source === selectedNode || edge.target === selectedNode
            ).slice(0, 20); // Limite menor pois são conexões sequenciais
        } else {
            // FORMA 1: Todas as conexões sequenciais (limitadas a 50 para performance)
            return validSequentialEdges.slice(0, 50);
        }
    }, [edges, mode, selectedNode]);

    // Calcular probabilidades sequenciais para o nó selecionado (FORMA 3)
    const selectedNodeProbabilities = useMemo(() => {
        if (mode !== 'interactive' || !selectedNode) return new Map();
        
        const probabilities = new Map<number, number>();
        const selectedEdges = edges.filter(edge => 
            (edge.source === selectedNode || edge.target === selectedNode) && edge.frequency > 0
        );
        
        const totalConnections = selectedEdges.reduce((sum, edge) => sum + edge.frequency, 0);
        
        if (totalConnections > 0) {
            selectedEdges.forEach(edge => {
                const connectedNode = edge.source === selectedNode ? edge.target : edge.source;
                const probability = edge.frequency / totalConnections;
                probabilities.set(connectedNode, probability);
            });
        }
        
        return probabilities;
    }, [edges, selectedNode, mode]);

    // Handler para clique no nó
    const handleNodeClick = (nodeId: number) => {
        if (mode === 'interactive') {
            setSelectedNode(prev => prev === nodeId ? null : nodeId);
        }
        console.log('FORMA 3D - Nó clicado:', nodeId);
    };

    // Geometria das linhas para as conexões SEQUENCIAIS
    const lineGeometry = useMemo(() => {
        const positions: number[] = [];
        const colors: number[] = [];
        
        relevantEdges.forEach(edge => {
            const sourcePos = nodePositions.get(edge.source);
            const targetPos = nodePositions.get(edge.target);
            
            if (sourcePos && targetPos) {
                // Adicionar linha da fonte ao alvo
                positions.push(sourcePos[0], sourcePos[1], sourcePos[2]);
                positions.push(targetPos[0], targetPos[1], targetPos[2]);
                
                // Cor baseada na frequência da conexão SEQUENCIAL
                const intensity = Math.min(1, edge.normalizedFrequency * 2);
                const r = 0.2 + intensity * 0.8; // Vermelho cresce com frequência
                const g = 0.8; // Verde constante
                const b = 0.2 + (1 - intensity) * 0.6; // Azul diminui com frequência
                
                // Duas vezes pois cada linha tem dois pontos
                colors.push(r, g, b, r, g, b);
            }
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        return geometry;
    }, [relevantEdges, nodePositions]);

    return (
        <div className="w-full h-full">
            <Canvas
                camera={{ position: mode === 'interactive' ? [0, 0, 20] : [20, 10, 20], fov: 45 }}
                style={{ width: '100%', height: '100%' }}
                gl={{ preserveDrawingBuffer: false, antialias: false }}
            >
                <ambientLight intensity={0.6} />
                <pointLight position={[15, 15, 15]} intensity={1.2} />
                
                {/* Renderizar nós baseados no modo */}
                {nodes.map(node => {
                    const position = nodePositions.get(node.id);
                    if (!position) return null;
                    
                    if (mode === 'interactive') {
                        const probability = selectedNodeProbabilities.get(node.id);
                        return (
                            <Form3InteractiveNode
                                key={node.id}
                                node={node}
                                basePosition={position}
                                isSelected={selectedNode === node.id}
                                probability={probability}
                                onClick={() => handleNodeClick(node.id)}
                            />
                        );
                    } else {
                        return (
                            <Form1GraphNode
                                key={node.id}
                                node={node}
                                position={position}
                                onClick={() => handleNodeClick(node.id)}
                            />
                        );
                    }
                })}

                {/* Conexões SEQUENCIAIS com espessura baseada na frequência */}
                <lineSegments geometry={lineGeometry}>
                    <lineBasicMaterial 
                        vertexColors 
                        transparent 
                        opacity={0.8}
                        linewidth={3}
                    />
                </lineSegments>

                <OrbitControls
                    enableZoom
                    enablePan
                    enableRotate
                    autoRotate={mode === 'graph'}
                    autoRotateSpeed={0.5}
                />
            </Canvas>
            
            {/* Info overlay ATUALIZADO */}
            <div className="absolute top-4 left-4 bg-black/90 text-white p-3 rounded">
                <div className="text-cyan-400 font-semibold">
                    {mode === 'graph' ? 'Grafo 3D Sequencial' : '3D Interativo Sequencial'}
                </div>
                <div className="text-sm">
                    {mode === 'graph' 
                        ? 'Nós por frequência | Arestas sequenciais apenas'
                        : 'Clique nos números para ver conexões sequenciais'
                    }
                </div>
                <div className="text-xs">
                    Nós: {nodes.length} | Conexões sequenciais: {relevantEdges.length}
                </div>
                <div className="text-xs text-yellow-400 mt-1">
                    🔗 Conexões entre números consecutivos nos resultados
                </div>
                {selectedNode && mode === 'interactive' && (
                    <div className="text-xs text-orange-400 mt-2">
                        Nó selecionado: {selectedNode}
                        <br />Conexões sequenciais: {selectedNodeProbabilities.size}
                    </div>
                )}
            </div>
        </div>
    );
};