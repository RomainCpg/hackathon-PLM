import React, { useCallback, useMemo, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Task } from '../types';
import TaskNode from './TaskNode';
import '../styles/FlowDiagram.css';

interface FlowDiagramProps {
    tasks: Task[];
    onTasksUpdate?: (tasks: Task[]) => void;
}

const FlowDiagram: React.FC<FlowDiagramProps> = ({ tasks, onTasksUpdate }) => {
    const nodeTypes = useMemo(() => ({ taskNode: TaskNode }), []);

    // Create initial nodes from tasks
    const initialNodes: Node[] = useMemo(() => {
        return tasks.map((task, index) => {
            // Use saved position or calculate default
            const x = task.position?.x ?? (index % 5) * 350 + 50;
            const y = task.position?.y ?? Math.floor(index / 5) * 200 + 50;

            return {
                id: task.id,
                type: 'taskNode',
                position: { x, y },
                data: {
                    task,
                    label: task.title,
                },
            };
        });
    }, [tasks]);

    // Create initial edges from task dependencies
    const initialEdges: Edge[] = useMemo(() => {
        const edges: Edge[] = [];
        
        tasks.forEach(task => {
            if (task.dependencies && task.dependencies.length > 0) {
                task.dependencies.forEach(depId => {
                    const edgeColor = task.status === 'done' ? '#4caf50' :
                        task.status === 'in-progress' ? '#ff9800' :
                        task.status === 'review' ? '#ffc107' : '#2196f3';

                    edges.push({
                        id: `e${depId}-${task.id}`,
                        source: depId,
                        target: task.id,
                        type: 'smoothstep',
                        animated: task.status === 'in-progress',
                        style: {
                            stroke: edgeColor,
                            strokeWidth: 3,
                        },
                        markerEnd: {
                            type: 'arrowclosed',
                            color: edgeColor,
                        },
                    });
                });
            }
        });

        return edges;
    }, [tasks]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes and edges when tasks change
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    // Save node positions when they change
    const handleNodesChange = useCallback((changes: any) => {
        onNodesChange(changes);
        
        // Save positions after drag
        if (onTasksUpdate && changes.some((c: any) => c.type === 'position' && c.dragging === false)) {
            const updatedTasks = tasks.map(task => {
                const node = nodes.find(n => n.id === task.id);
                if (node) {
                    return {
                        ...task,
                        position: node.position
                    };
                }
                return task;
            });
            onTasksUpdate(updatedTasks);
        }
    }, [onNodesChange, onTasksUpdate, tasks, nodes]);

    // Handle new connections
    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge(params, eds));
            
            // Update task dependencies
            if (onTasksUpdate && params.source && params.target) {
                const updatedTasks = tasks.map(task => {
                    if (task.id === params.target) {
                        const deps = task.dependencies || [];
                        if (!deps.includes(params.source!)) {
                            return {
                                ...task,
                                dependencies: [...deps, params.source!]
                            };
                        }
                    }
                    return task;
                });
                onTasksUpdate(updatedTasks);
            }
        },
        [setEdges, onTasksUpdate, tasks]
    );

    // Handle edge deletion
    const handleEdgesChange = useCallback((changes: any) => {
        onEdgesChange(changes);
        
        // Handle edge removal
        const removedEdges = changes.filter((c: any) => c.type === 'remove');
        if (onTasksUpdate && removedEdges.length > 0) {
            const updatedTasks = tasks.map(task => {
                let updatedDeps = task.dependencies || [];
                
                removedEdges.forEach((change: any) => {
                    const edge = edges.find(e => e.id === change.id);
                    if (edge && edge.target === task.id) {
                        updatedDeps = updatedDeps.filter(depId => depId !== edge.source);
                    }
                });
                
                if (updatedDeps.length !== (task.dependencies || []).length) {
                    return { ...task, dependencies: updatedDeps };
                }
                return task;
            });
            onTasksUpdate(updatedTasks);
        }
    }, [onEdgesChange, onTasksUpdate, tasks, edges]);

    return (
        <div className="flow-diagram-container">
            <div className="flow-controls">
                <span className="flow-label">💡 Organisez vos tâches :</span>
                <span className="flow-hint">Glissez les nœuds et connectez-les pour créer votre workflow</span>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls />
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                />
            </ReactFlow>
        </div>
    );
};

export default FlowDiagram;
