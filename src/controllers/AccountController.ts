import { AccountService } from "../services/AccountServices";
import { UserService } from "../services/UserServices";
import { Account } from "../models/Account";
import { Request, Response, Router } from "express";
import { v4 as uuid, v4 } from 'uuid';


export class AccountController{
    public path: string = "/account";
    public router: Router = Router();
    private readonly accountService: AccountService = new AccountService();
    private readonly userService : UserService;
    constructor (userService: UserService) {
        this.accountService = new AccountService();
        this.userService = userService;
        this.initRoutes();
    }

    private initRoutes(){
        this.router.get(this.path + '/:id', this.getAccountById.bind(this));
        this.router.get(this.path + '/user/:id', this.getUserAccounts.bind(this));
        this.router.get(this.path + 's/:status', this.getAccountByStatus.bind(this));
        this.router.post(this.path, this.postCreateAccount.bind(this));
        this.router.post(this.path + '/delete/:id', this.postDeleteAccount.bind(this));
    }

    public async postDeleteAccount(req: Request, res: Response){
        const account = await this.accountService.postDeleteCallById(req.params.id);
        if (account == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(account); 
        }; 
    }

    public async postCreateAccount(req: Request, res: Response) {
        const { userId, name, balance } = req.body;

        // Verifique se o usuário existe
        const userExists = await this.userService.getUserById(userId);
        if (!userExists) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        const newAccount: Account = {
            accountId: uuid(),
            userId: userId, 
            name: name,
            balance: balance,
            status: true,
            transactions: []
        };

        const response = await this.accountService.postCreateAccount(newAccount);
        if (!response) {
            res.status(400).send({ message: "Error creating account" });
            return;
        }

        // Verifique se userExists.accounts está definido antes de manipulá-lo
        if (userExists.accounts === undefined) {
            userExists.accounts = []; // Inicialize como um array vazio, se for o caso
        }

        // Adicione a nova conta ao array de contas do usuário
        userExists.accounts.push(newAccount);

        // Atualize o usuário com a nova conta
        await this.userService.postUpdateUserById(userId, userExists);

        res.status(200).send(response);
    }

    public async getAccountById(req: Request, res: Response){
        const account = await this.accountService.getAccountById(req.params.id);
        if (account == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(account); 
        };
    }

    public async getUserAccounts(req: Request, res: Response){
        const accounts = await this.accountService.getUserAccounts(req.params.id);
        if (accounts == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(accounts); 
        };
    }

    public async getAccountByStatus(req: Request, res: Response){
        const accounts = await this.accountService.getAccountByStatus(Boolean(req.params.status));
        if (accounts == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(accounts); 
        };
    }

    public async postUpdateUserById(req: Request, res: Response){
        const response = await this.accountService.postUpdateAccountById(req.params.id, req.body);
        if (response == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(response); 
        }; 
    }
}