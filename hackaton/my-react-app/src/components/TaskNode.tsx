import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { Task } from '../types';
import '../styles/FlowNode.css';

export type TaskNodeData = {
    task: Task;
    label: string;
};

const TaskNode = ({ data }: NodeProps) => {
    const taskData = data as TaskNodeData;
    const task = taskData.task;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'todo': return '📋';
            case 'in-progress': return '⚙️';
            case 'review': return '👀';
            case 'done': return '✅';
            default: return '📌';
        }
    };

    const getDepartmentIcon = (department: string) => {
        switch (department) {
            case 'clients': return '👥';
            case 'logistics': return '🚚';
            case 'services': return '🔧';
            default: return '📦';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'todo': return '#e3f2fd';
            case 'in-progress': return '#fff3e0';
            case 'review': return '#fce4ec';
            case 'done': return '#e8f5e9';
            default: return '#f5f5f5';
        }
    };

    const getDepartmentColor = (department: string) => {
        switch (department) {
            case 'clients': return '#2196f3';
            case 'logistics': return '#ff9800';
            case 'services': return '#4caf50';
            default: return '#757575';
        }
    };

    return (
        <div
            className="task-flow-node"
            style={{ backgroundColor: getStatusColor(task.status) }}
        >
            {/* Handle d'entrée (gauche) */}
            <Handle
                type="target"
                position={Position.Left}
                id="target"
                style={{ background: '#555', width: 10, height: 10 }}
            />

            <div className="task-node-body">
                <div className="task-node-title">{task.title}</div>
                <div className="task-node-info">
                    <div className="task-node-row">
                        <strong>Durée Prévue:</strong> {task['tempsPrévu'] || 'N/A'}
                    </div>
                    <div className="task-node-row">
                        <strong>Temps réel:</strong> {task['tempsRéel'] || 'N/A'}
                    </div>
                    {task['aléasIndustriels'] && (
                        <div className="task-node-row">
                            <strong>Aléas:</strong> {task['aléasIndustriels']}
                        </div>
                    )}
                    {task.causePotentielle && (
                        <div className="task-node-row">
                            <strong>Causes:</strong> {task.causePotentielle}
                        </div>
                    )}
                </div>
            </div>

            {/* Handle de sortie (droite) */}
            <Handle
                type="source"
                position={Position.Right}
                id="source"
                style={{ background: '#555', width: 10, height: 10 }}
            />
        </div>
    );
};

export default TaskNode;
