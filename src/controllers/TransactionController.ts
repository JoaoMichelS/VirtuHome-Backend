import { TransactionService } from "../services/TransactionServices";
import { AccountService } from "../services/AccountServices";
import { Transaction } from "../models/Transaction";
import { Request, Response, Router } from "express";
import { v4 as uuid, v4 } from 'uuid';
import { UserService } from "../services/UserServices";
import { GoalService } from "../services/GoalServices";

export class TransactionController{
    public path: string = "/transaction";
    public router: Router = Router();
    private readonly transactionService: TransactionService = new TransactionService();
    private readonly accountService: AccountService = new AccountService();
    private readonly goalService: GoalService = new GoalService();
    constructor () {
        this.accountService = new AccountService();
        this.goalService = new GoalService();
        this.initRoutes();
    }

    private initRoutes(){
        this.router.get(this.path + '/:id', this.getTransactionById.bind(this));
        this.router.get(this.path + '/user/:id', this.getUserTransaction.bind(this));
        this.router.get(this.path + '/dateRange', this.getTransactionsByDateRange.bind(this));
        this.router.post(this.path, this.postCreateTransaction.bind(this));
        this.router.delete(this.path + '/delete/:id', this.deleteTransactionById.bind(this));
        this.router.post(this.path + '/:id', this.postUpdateTransactionById.bind(this));
    }

    public async postUpdateTransactionById(req: Request, res: Response){
        const response = await this.transactionService.postUpdateTransactionById(req.params.id, req.body);
        if (response == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(response); 
        }; 
    }

    public async getTransactionsByDateRange(req: Request, res: Response){
        const { userId, startDate, endDate } = req.body;
        const transactions = await this.transactionService.getTransactionsByDateRange(userId, startDate, endDate);
        if (transactions == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(transactions); 
        }; 
    }
    
    public async deleteTransactionById(req: Request, res: Response){
        const account = await this.transactionService.postDeleteTransactionById(req.params.id);
        if (account == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(account); 
        }; 
    }

    public async postCreateTransaction(req: Request, res: Response) {
        const { id, accountId, userId, amount, type, category, description, date } = req.body;

        // Verifique se a conta existe
        const accountExists = await this.accountService.getAccountById(accountId);
        if (!accountExists) {
            res.status(404).send({ message: "Account not found" });
            return;
        }

        const newTransaction: Transaction = {
            id: uuid(),
            accountId: accountId,
            userId: userId,
            amount: amount,
            type: type,
            category: category,
            description: description,
            date: date
        };

        const response = await this.transactionService.postCreateTransaction(newTransaction);
        if (!response) {
            res.status(400).send({ message: "Error creating transaction" });
            return;
        }

        if (accountExists.transactions === undefined) {
            accountExists.transactions = []; 
        }

        // Adicione a nova conta ao array de transações a contas
        accountExists.transactions.push(newTransaction);
        
        // Atualize a conta com a nova transação
        await this.accountService.postUpdateAccountById(accountId, type, amount);

        res.status(200).send(response);
    }

    public async getTransactionById(req: Request, res: Response){
        const account = await this.transactionService.getTransactionById(req.params.id);
        if (account == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(account); 
        };
    }

    public async getUserTransaction(req: Request, res: Response){
        const accounts = await this.transactionService.getUserTransaction(req.params.id);
        if (accounts == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(accounts); 
        };
    }
}