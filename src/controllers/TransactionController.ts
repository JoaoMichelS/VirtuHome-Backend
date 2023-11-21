import { TransactionService } from "../services/TransactionServices";
import { AccountService } from "../services/AccountServices";
import { Transaction } from "../models/Transaction";
import { Request, Response, Router } from "express";
import { v4 as uuid, v4 } from 'uuid';
import { UserService } from "../services/UserServices";

export class TransactionController{
    public path: string = "/transaction";
    public router: Router = Router();
    private readonly transactionService: TransactionService = new TransactionService();
    private readonly accountService: AccountService = new AccountService();
    constructor () {
        this.accountService = new AccountService();
        this.initRoutes();
    }

    private initRoutes(){
        this.router.get(this.path + '/:id', this.getTransactionById.bind(this));
        this.router.get(this.path + 's/:id', this.getUserTransaction.bind(this));
        this.router.post(this.path, this.postCreateTransaction.bind(this));
        this.router.post(this.path + '/delete/:id', this.postDeleteTransaction.bind(this));
    }

    public async postDeleteTransaction(req: Request, res: Response){
        const account = await this.accountService.postDeleteCallById(req.params.id);
        if (account == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(account); 
        }; 
    }

    public async postCreateTransaction(req: Request, res: Response) {
        const { id, accountId, amount, type, description, date } = req.body;

        // Verifique se a conta existe
        const accountExists = await this.accountService.getAccountById(accountId);
        if (!accountExists) {
            res.status(404).send({ message: "Account not found" });
            return;
        }

        const newTransaction: Transaction = {
            id: uuid(),
            accountId: accountId,
            amount: amount,
            type: type,
            description: description,
            date: date
        };

        const response = await this.transactionService.postCreateTransaction(newTransaction);
        if (!response) {
            res.status(400).send({ message: "Error creating transaction" });
            return;
        }

        // Verifique se userExists.accounts está definido antes de manipulá-lo
        if (accountExists.transactions === undefined) {
            accountExists.transactions = []; // Inicialize como um array vazio, se for o caso
        }

        // Adicione a nova conta ao array de transações a contas
        accountExists.transactions.push(newTransaction);

        // Atualize o usuário com a nova conta
        await this.accountService.postUpdateAccountById(accountId, accountExists);

        res.status(200).send(response);
    }

    public async getTransactionById(req: Request, res: Response){
        const account = await this.accountService.getAccountById(req.params.id);
        if (account == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(account); 
        };
    }

    public async getUserTransaction(req: Request, res: Response){
        const accounts = await this.accountService.getUserAccounts(req.params.id);
        if (accounts == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(accounts); 
        };
    }
}