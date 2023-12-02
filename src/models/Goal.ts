enum SpendingCategory {}

export interface Goal {
    id: string;
    userId: string;
    description: string;
    monthlyIncome: number;
    targetValue: number; 
    spendingCategories: SpendingCategory[];
    startDate: Date;
    endDate: Date;
    //progress: number; // Progresso em direção à meta
    status: 'active' | 'completed' | 'abandoned'; // Estado da meta
    //notes?: string; // Notas opcionais sobre a meta
}

export interface GoalResponse {
    goal: Goal | undefined;
    id: string; 
}
