import { GoalService } from "../services/GoalServices";
import { UserService } from "../services/UserServices";
import { Goal } from "../models/Goal";
import { Request, Response, Router } from "express";
import { v4 as uuid, v4 } from 'uuid';
import { AccountService } from "../services/AccountServices";
import { TransactionService } from "../services/TransactionServices";


export class GoalController{
    public path: string = "/goal";
    public router: Router = Router();
    private readonly goalService: GoalService = new GoalService();
    private readonly accountService: AccountService = new AccountService();
    private readonly transactionService: TransactionService = new TransactionService();
    private readonly userService : UserService;
    constructor (userService: UserService) {
        this.goalService = new GoalService();
        this.accountService = new AccountService();
        this.transactionService = new TransactionService();
        this.userService = userService;
        this.initRoutes();
    }

    private initRoutes(){
        this.router.get(this.path + '/:id', this.getGoalById.bind(this));
        this.router.get(this.path + '/user/:id', this.getUserGoals.bind(this));
        this.router.get(this.path + '/monthlyBalances/:id', this.getMonthlyBalances.bind(this));
        this.router.get(this.path + 's/:status', this.getGoalByStatus.bind(this));
        this.router.post(this.path, this.postCreateGoal.bind(this));
        this.router.delete(this.path + '/delete/:id', this.deleteGoalById.bind(this));
        this.router.post(this.path + '/checkGoal', this.postCheckGoal.bind(this));
        this.router.post(this.path + '/:id', this.postUpdateGoalById.bind(this));
    }

    public async postCheckGoal(req: Request, res: Response){
        const { userId, startDate, endDate, goalId } = req.body;

        const goalExists = await this.goalService.getGoalById(goalId);
        if (!goalExists) {
            res.status(404).send({ message: "Goal not found" });
            return;
        }

        const transactions = await this.transactionService.getTransactionsByDateRange(userId, startDate, endDate);
        //const respone = await this.goalService.postUpdateGoalStatus(goalId, transactions);
        
        //res.status(200).send({ message: "Goal check performed successfully" });
        res.status(200).send({ message: "Goal" });
    }

    public async deleteGoalById(req: Request, res: Response){
        const account = await this.goalService.postDeleteCallById(req.params.id);
        if (account == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(account); 
        }; 
    }

    public async postCreateGoal(req: Request, res: Response) {
        const { userId, status, description, targetValue, balance, startDate, endDate } = req.body;

        // Verifique se o usuário existe
        const userExists = await this.userService.getUserById(userId);
        if (!userExists) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        const newGoal: Goal = {
            id: uuid(),
            userId: userId, 
            description: description,
            targetValue: targetValue,
            balance: balance,
            startDate: startDate,
            endDate: endDate,
            status: status
        };

        const response = await this.goalService.postCreateGoal(newGoal);
        if (!response) {
            res.status(400).send({ message: "Error creating account" });
            return;
        }

        // Verifique se userExists.accounts está definido antes de manipulá-lo
        if (userExists.goals === undefined) {
            userExists.goals = []; // Inicialize como um array vazio, se for o caso
        }

        // Adicione a nova conta ao array de contas do usuário
        userExists.goals.push(newGoal);

        // Atualize o usuário com a nova conta
        await this.userService.postUpdateUserById(userId, userExists);

        res.status(200).send(response);
    }

    public async getGoalById(req: Request, res: Response){
        const account = await this.goalService.getGoalById(req.params.id);
        if (account == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(account); 
        };
    }

    public async getMonthlyBalances(req: Request, res: Response){
        const accounts = await this.goalService.getUserGoals(req.params.id);
        if (accounts == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(accounts); 
        };
    }

    public async getUserGoals(req: Request, res: Response){
        const accounts = await this.goalService.getUserGoals(req.params.id);
        if (accounts == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(accounts); 
        };
    }

    public async getGoalByStatus(req: Request, res: Response){
        const accounts = await this.goalService.getGoalByStatus(Boolean(req.params.status));
        if (accounts == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(accounts); 
        };
    }

     public async postUpdateGoalById(req: Request, res: Response){
        const response = await this.goalService.postUpdateGoalById(req.params.id, req.body);
        if (response == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(response); 
        }; 
     }
}