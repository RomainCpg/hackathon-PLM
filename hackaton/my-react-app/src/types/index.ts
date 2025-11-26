export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    department: 'clients' | 'logistics' | 'services';
    assignedTo?: string;
    dueDate?: string;
    createdAt: string;
    order: number;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    tasks: Task[];
    createdAt: string;
    status: 'active' | 'completed' | 'on-hold';
}

export interface Department {
    id: string;
    name: string;
    color: string;
    icon: string;
}
