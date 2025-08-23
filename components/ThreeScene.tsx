/// <reference types="@react-three/fiber" />
import React, { useMemo, useRef, useState, useEffect, forwardRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { AnalysisResult, Node as NodeType } from '../types';

interface ThreeSceneProps {
    analysis: AnalysisResult;
    mode: 'graph' | 'interactive';
}

const NODE_RADIUS = 0.8;

// Each node is responsible for its own animation
const AnimatedNode = forwardRef<THREE.Group, { node: NodeType; targetPosition: THREE.Vector3; onClick: (id: number) => void }>(({ node, targetPosition, onClick }, ref) => {
    useFrame((_, delta) => {
        const group = (ref as React.RefObject<THREE.Group>)?.current;
        if (group && targetPosition) {
            const currentPos = group.position;
            if (!currentPos.equals(targetPosition)) {
                if (currentPos.distanceTo(targetPosition) > 0.01) {
                    currentPos.lerp(targetPosition, delta * 5);
                } else {
                    currentPos.copy(targetPosition);
                }
            }
        }
    });

    return (
        <group ref={ref} onClick={() => onClick(node.id)}>
            <mesh>
                <sphereGeometry args={[NODE_RADIUS, 32, 32]} />
                <meshStandardMaterial
                    transparent={true}
                    opacity={0.2}
                    color="cyan"
                    roughness={0.1}
                    metalness={0.1}
                />
            </mesh>
            <Text
                position={[0, 0, 0]}
                fontSize={0.5}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {node.id.toString()}
            </Text>
        </group>
    );
});

interface AnimatedEdgeProps {
    startNodeRef: React.RefObject<THREE.Group>;
    endNodeRef: React.RefObject<THREE.Group>;
    mode: 'graph' | 'interactive';
}

const AnimatedEdge: React.FC<AnimatedEdgeProps> = ({ startNodeRef, endNodeRef, mode }) => {
    const lineRef = useRef<THREE.Line>(null!);
    const geometry = useMemo(() => new THREE.BufferGeometry(), []);

    useFrame(() => {
        if (!lineRef.current || !startNodeRef.current || !endNodeRef.current) {
            return;
        }

        const startVec = startNodeRef.current.position;
        const endVec = endNodeRef.current.position;

        const dir = endVec.clone().sub(startVec);
        if (dir.lengthSq() < 0.0001) {
            lineRef.current.visible = false;
            return;
        }
        lineRef.current.visible = true;
        dir.normalize();

        const startPoint = startVec.clone().add(dir.clone().multiplyScalar(NODE_RADIUS));
        const endPoint = endVec.clone().sub(dir.clone().multiplyScalar(NODE_RADIUS));

        const midPoint = startPoint.clone().lerp(endPoint, 0.5);
        let controlPoint;

        if (mode === 'graph') {
            const curveAmount = startPoint.distanceTo(endPoint) * 0.3;
            controlPoint = midPoint.length() < 0.001
                ? new THREE.Vector3(0, curveAmount, 0)
                : midPoint.clone().normalize().multiplyScalar(midPoint.length() + curveAmount);
        } else { // interactive
            const curveAmount = startPoint.distanceTo(endPoint) * 0.2;
            controlPoint = new THREE.Vector3(midPoint.x, midPoint.y, midPoint.z + curveAmount);
        }

        const curve = new THREE.QuadraticBezierCurve3(startPoint, controlPoint, endPoint);
        const points = curve.getPoints(20);
        geometry.setFromPoints(points);
    });

    return (
        // @ts-ignore - Bypasses a TypeScript error where the JSX factory incorrectly
        // resolves this to an SVG <line> element instead of a R3F primitive.
        <line ref={lineRef} geometry={geometry}>
            <lineBasicMaterial color="rgba(255, 255, 255, 0.3)" />
        </line>
    );
};


export const ThreeScene: React.FC<ThreeSceneProps> = ({ analysis, mode }) => {
    const [selectedNode, setSelectedNode] = useState<number | null>(null);
    const [targetPositions, setTargetPositions] = useState<Map<number, THREE.Vector3>>(new Map());

    // Create stable refs for each node
    const nodeRefs = useMemo(() => {
        const refs = new Map<number, React.RefObject<THREE.Group>>();
        analysis.nodes.forEach(node => {
            refs.set(node.id, React.createRef<THREE.Group>());
        });
        return refs;
    }, [analysis.nodes]);

    // Calculate base positions (without animation)
    const basePositions = useMemo(() => {
        const positions = new Map<number, THREE.Vector3>();
        analysis.nodes.forEach(node => {
            let pos: THREE.Vector3;
            if (mode === 'interactive') {
                const grid_size = 5;
                const x = ((node.id - 1) % grid_size - (grid_size - 1) / 2) * 4;
                const y = (Math.floor((node.id - 1) / grid_size) - (grid_size - 1) / 2) * -4;
                pos = new THREE.Vector3(x, y, 0);
            } else {
                const phi = Math.acos(-1 + (2 * (node.id - 1)) / (25 - 1));
                const theta = Math.sqrt(25 * Math.PI) * phi;
                pos = new THREE.Vector3(
                    10 * Math.cos(theta) * Math.sin(phi),
                    10 * Math.sin(theta) * Math.sin(phi),
                    10 * Math.cos(phi)
                );
            }
            positions.set(node.id, pos);
        });
        return positions;
    }, [analysis.nodes, mode]);

    // Calculate target positions for animation when selection or mode changes
    useEffect(() => {
        const newTargets = new Map<number, THREE.Vector3>();
        analysis.nodes.forEach(node => {
            const basePos = basePositions.get(node.id)!;
            if (mode === 'interactive' && selectedNode !== null && node.id === selectedNode) {
                 newTargets.set(node.id, basePos.clone().setZ(5));
            } else {
                newTargets.set(node.id, basePos);
            }
        });
        setTargetPositions(newTargets);
        
        // When mode changes or selection is cleared, immediately update node positions to avoid visual jump
        if (mode === 'graph' || selectedNode === null) {
            nodeRefs.forEach((ref, id) => {
                if (ref.current) {
                    ref.current.position.copy(basePositions.get(id)!);
                }
            });
        }
    }, [selectedNode, mode, basePositions, analysis.nodes, nodeRefs]);

    const handleNodeClick = (id: number) => {
        if (mode === 'interactive') {
            setSelectedNode(prev => (prev === id ? null : id));
        }
    };

    const edgesToRender = useMemo(() => {
        if (mode === 'interactive' && selectedNode !== null) {
            return analysis.edges.filter(e => e.source === selectedNode || e.target === selectedNode);
        }
        if (mode === 'graph') {
             return analysis.edges;
        }
        return [];
    }, [analysis.edges, selectedNode, mode]);

    return (
        <Canvas 
            camera={{ position: [0, 0, 25], fov: 50 }} 
            style={{ position: 'absolute', inset: '0.5rem' }}
        >
            <ambientLight intensity={0.8} />
            <pointLight position={[20, 20, 20]} intensity={1} />
            <pointLight position={[-20, -20, -20]} intensity={0.5} />
            
            {analysis.nodes.map(node => {
                const targetPos = targetPositions.get(node.id);
                const nodeRef = nodeRefs.get(node.id);
                if (!targetPos || !nodeRef) return null;
                
                return (
                    <AnimatedNode
                        key={node.id}
                        ref={nodeRef}
                        node={node}
                        targetPosition={targetPos}
                        onClick={handleNodeClick}
                    />
                );
            })}

            {edgesToRender.map(edge => {
                const startNodeRef = nodeRefs.get(edge.source);
                const endNodeRef = nodeRefs.get(edge.target);
                if (!startNodeRef || !endNodeRef) return null;

                return (
                    <AnimatedEdge
                        key={`${edge.source}-${edge.target}`}
                        startNodeRef={startNodeRef}
                        endNodeRef={endNodeRef}
                        mode={mode}
                    />
                );
            })}
            
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
    );
};