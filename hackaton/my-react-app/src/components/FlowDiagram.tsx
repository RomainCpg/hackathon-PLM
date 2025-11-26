import React, { useCallback, useMemo } from 'react';
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
}

type LayoutMode = 'sequential' | 'departmental' | 'status';

const FlowDiagram: React.FC<FlowDiagramProps> = ({ tasks }) => {
    const [layoutMode, setLayoutMode] = React.useState<LayoutMode>('sequential');
    const nodeTypes = useMemo(() => ({ taskNode: TaskNode }), []);

    // Créer les nœuds à partir des tâches avec différents layouts
    const initialNodes: Node[] = useMemo(() => {
        const deptOrder = { clients: 0, logistics: 1, services: 2 };
        const statusOrder = { todo: 0, 'in-progress': 1, review: 2, done: 3 };

        // Trier selon le mode
        const sortedTasks = [...tasks].sort((a, b) => {
            if (layoutMode === 'sequential') {
                // Ordre global : département puis ordre
                const deptDiff = (deptOrder[a.department] || 0) - (deptOrder[b.department] || 0);
                if (deptDiff !== 0) return deptDiff;
                return a.order - b.order;
            } else if (layoutMode === 'departmental') {
                // Par département puis ordre
                const deptDiff = (deptOrder[a.department] || 0) - (deptOrder[b.department] || 0);
                if (deptDiff !== 0) return deptDiff;
                return a.order - b.order;
            } else {
                // Par statut puis ordre
                const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
                if (statusDiff !== 0) return statusDiff;
                return a.order - b.order;
            }
        });

        return sortedTasks.map((task, index) => {
            let x = 50, y = 50;

            if (layoutMode === 'sequential') {
                // Layout horizontal en cascade
                x = index * 400 + 50;
                y = 50 + (index % 2) * 150;
            } else if (layoutMode === 'departmental') {
                // Layout par département (swimlanes verticales)
                const deptIndex = deptOrder[task.department] || 0;
                const deptTasks = sortedTasks.filter(t => t.department === task.department);
                const taskIndexInDept = deptTasks.findIndex(t => t.id === task.id);
                x = taskIndexInDept * 400 + 50;
                y = deptIndex * 250 + 50;
            } else {
                // Layout par statut (colonnes)
                const statusIndex = statusOrder[task.status] || 0;
                const statusTasks = sortedTasks.filter(t => t.status === task.status);
                const taskIndexInStatus = statusTasks.findIndex(t => t.id === task.id);
                x = statusIndex * 350 + 50;
                y = taskIndexInStatus * 200 + 50;
            }

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
    }, [tasks, layoutMode]);

    // Créer les arêtes pour relier toutes les tâches dans l'ordre
    const initialEdges: Edge[] = useMemo(() => {
        console.log('🔗 Creating edges for', tasks.length, 'tasks in mode:', layoutMode);
        const edges: Edge[] = [];
        const deptOrder = { clients: 0, logistics: 1, services: 2 };
        const statusOrder = { todo: 0, 'in-progress': 1, review: 2, done: 3 };

        // Trier dans le même ordre que les nœuds
        const sortedTasks = [...tasks].sort((a, b) => {
            if (layoutMode === 'sequential') {
                const deptDiff = (deptOrder[a.department] || 0) - (deptOrder[b.department] || 0);
                if (deptDiff !== 0) return deptDiff;
                return a.order - b.order;
            } else if (layoutMode === 'departmental') {
                const deptDiff = (deptOrder[a.department] || 0) - (deptOrder[b.department] || 0);
                if (deptDiff !== 0) return deptDiff;
                return a.order - b.order;
            } else {
                const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
                if (statusDiff !== 0) return statusDiff;
                return a.order - b.order;
            }
        });

        // Créer une connexion entre chaque tâche et la suivante
        sortedTasks.forEach((task, idx) => {
            if (idx < sortedTasks.length - 1) {
                const nextTask = sortedTasks[idx + 1];

                // Couleur selon le département de la tâche source
                const edgeColor = task.department === 'clients' ? '#2196f3' :
                    task.department === 'logistics' ? '#ff9800' :
                        task.department === 'services' ? '#4caf50' : '#999';

                // Animation si une des tâches est en cours
                const isAnimated = nextTask.status === 'in-progress' || task.status === 'in-progress';

                edges.push({
                    id: `e${task.id}-${nextTask.id}`,
                    source: task.id,
                    target: nextTask.id,
                    type: 'smoothstep',
                    animated: isAnimated,
                    style: {
                        stroke: edgeColor,
                        strokeWidth: 3,
                    },
                    markerEnd: {
                        type: 'arrowclosed',
                        color: edgeColor,
                    },
                });
            }
        });

        console.log('✅ Created', edges.length, 'edges:', edges);
        return edges;
    }, [tasks, layoutMode]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Mettre à jour les nœuds et edges quand le layout change
    React.useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    return (
        <div className="flow-diagram-container">
            <div className="flow-controls">
                <span className="flow-label">Layout :</span>
                <button
                    className={`layout-btn ${layoutMode === 'sequential' ? 'active' : ''}`}
                    onClick={() => setLayoutMode('sequential')}
                    title="Vue séquentielle - toutes les tâches reliées dans l'ordre"
                >
                    ➡️ Séquentiel
                </button>
                <button
                    className={`layout-btn ${layoutMode === 'departmental' ? 'active' : ''}`}
                    onClick={() => setLayoutMode('departmental')}
                    title="Vue par département - organisé par swimlanes"
                >
                    🏢 Par Département
                </button>
                <button
                    className={`layout-btn ${layoutMode === 'status' ? 'active' : ''}`}
                    onClick={() => setLayoutMode('status')}
                    title="Vue par statut - colonnes de progression"
                >
                    📊 Par Statut
                </button>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
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
