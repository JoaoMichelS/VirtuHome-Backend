import { GoalService } from "../services/GoalServices";
import { UserService } from "../services/UserServices";
import { Goal } from "../models/Goal";
import { Request, Response, Router } from "express";
import { v4 as uuid, v4 } from 'uuid';


export class GoalController{
    public path: string = "/goal";
    public router: Router = Router();
    private readonly accountService: GoalService = new GoalService();
    private readonly userService : UserService;
    constructor (userService: UserService) {
        this.accountService = new GoalService();
        this.userService = userService;
        this.initRoutes();
    }

    private initRoutes(){
        this.router.get(this.path + '/:id', this.getGoalById.bind(this));
        this.router.get(this.path + '/user/:id', this.getUserGoals.bind(this));
        this.router.get(this.path + '/monthlyBalances/:id', this.getMonthlyBalances.bind(this));
        this.router.get(this.path + 's/:status', this.getGoalByStatus.bind(this));
        this.router.post(this.path, this.postCreateGoal.bind(this));
        this.router.post(this.path + '/delete/:id', this.postDeleteGoal.bind(this));
    }

    public async postDeleteGoal(req: Request, res: Response){
        const account = await this.accountService.postDeleteCallById(req.params.id);
        if (account == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(account); 
        }; 
    }

    public async postCreateGoal(req: Request, res: Response) {
        const { userId, status, description, monthlyIncome, targetValue, percentageSave, spendingCategories } = req.body;

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
            monthlyIncome: monthlyIncome,
            targetValue: targetValue,
            percentageSave: percentageSave,
            spendingCategories: spendingCategories,
            status: status
        };

        const response = await this.accountService.postCreateGoal(newGoal);
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
        const account = await this.accountService.getGoalById(req.params.id);
        if (account == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(account); 
        };
    }

    public async getMonthlyBalances(req: Request, res: Response){
        const accounts = await this.accountService.getUserGoals(req.params.id);
        if (accounts == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(accounts); 
        };
    }

    public async getUserGoals(req: Request, res: Response){
        const accounts = await this.accountService.getUserGoals(req.params.id);
        if (accounts == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(accounts); 
        };
    }

    public async getGoalByStatus(req: Request, res: Response){
        const accounts = await this.accountService.getGoalByStatus(Boolean(req.params.status));
        if (accounts == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(accounts); 
        };
    }

    // public async postUpdateUserById(req: Request, res: Response){
    //     const response = await this.accountService.postUpdateGoalById(req.params.id, req.body);
    //     if (response == undefined) {
    //         res.status(400).send({message:"Error"});
    //     }
    //     else {
    //         res.status(200).send(response); 
    //     }; 
    // }
}