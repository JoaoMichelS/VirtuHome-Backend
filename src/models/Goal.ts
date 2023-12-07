enum SpendingCategory {}

export interface Goal {
    id: string;
    userId: string;
    description: string;
    targetValue: number; 
    balance: number;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'completed' | 'abandoned'; 
}

export interface GoalResponse {
    goal: Goal | undefined;
    id: string; 
}
