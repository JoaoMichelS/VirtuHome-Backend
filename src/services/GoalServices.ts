import { GoalRepository } from "../repositories/GoalRepository";
import { Goal, GoalResponse } from "../models/Goal";

export class GoalService{
    private readonly accountRepository: GoalRepository = new GoalRepository();

    constructor() {}

    public async postUpdateGoalStatus(goalId: string, transactions: any[]): Promise<GoalResponse | undefined> {
        return this.accountRepository.updateGoalStatus(goalId, transactions);
    }

    public async getGoalById(goalId: string): Promise<GoalResponse | undefined> {
        return this.accountRepository.findGoalById(goalId);
    }

    public async getUserGoals(id: string): Promise<Goal[] | undefined> {
        return this.accountRepository.findUserGoals(id);
    }

    public async getGoalByStatus(status: boolean): Promise<Goal[] | undefined> {
        return this.accountRepository.findGoalByStatus(status);
    }

    public async postCreateGoal(newGoal: Goal): Promise<GoalResponse | undefined> {
        return this.accountRepository.createGoal(newGoal);
    }

    public async postDeleteCallById(id: string): Promise<GoalResponse | undefined>{
        return this.accountRepository.deleteGoalById(id);
    }

    public async postUpdateGoalById(id: string, data: any,): Promise<GoalResponse | undefined>{
        return this.accountRepository.updateGoalById(id, data);
    }

}