import { GoalRepository } from "../repositories/GoalRepository";
import { Goal, GoalResponse } from "../models/Goal";
import { Transaction } from "../models/Transaction";

export class GoalService{
    private readonly goalRepository: GoalRepository = new GoalRepository();

    constructor() {}

    public async postUpdateGoalStatus(goalId: string, transactions: Transaction[]): Promise<GoalResponse | undefined> {
        return this.goalRepository.VerifyGoal(goalId, transactions);
    }

    public async updateGoalStatusById(goalId: string, status: string): Promise<GoalResponse | undefined> {
        return this.goalRepository.updateGoalStatusById(goalId, status);
    }

    public async getGoalById(goalId: string): Promise<GoalResponse | undefined> {
        return this.goalRepository.findGoalById(goalId);
    }

    public async getUserGoals(id: string): Promise<Goal[] | undefined> {
        return this.goalRepository.findUserGoals(id);
    }

    public async getGoalByStatus(status: boolean): Promise<Goal[] | undefined> {
        return this.goalRepository.findGoalByStatus(status);
    }

    public async postCreateGoal(newGoal: Goal): Promise<GoalResponse | undefined> {
        return this.goalRepository.createGoal(newGoal);
    }

    public async postDeleteCallById(id: string): Promise<GoalResponse | undefined>{
        return this.goalRepository.deleteGoalById(id);
    }

    public async postUpdateGoalById(id: string, data: any,): Promise<Goal | undefined>{
        return this.goalRepository.updateGoalById(id, data);
    }

}