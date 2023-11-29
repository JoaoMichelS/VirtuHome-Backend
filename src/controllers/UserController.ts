import { Request, Response, Router } from "express";
import { User } from "../models/User";
import { UserService } from "../services/UserServices";

export class UserController{
    public path: string = "/user";
    public router: Router = Router();
    private readonly userService: UserService = new UserService();

    constructor () {
        this.initRoutes();
    }

    private initRoutes(){
        this.router.post(this.path, this.postCreateUser.bind(this));
        this.router.post(this.path + "/login", this.getUserByEmailAndPasswd.bind(this));
        this.router.post(this.path + '/:id', this.postUpdateUserById.bind(this));
        this.router.get(this.path + '/:id', this.getUserById.bind(this));
    }

    public async postCreateUser(req: Request, res: Response){
        const {name, email, password} = req.body;
        const newUser: User = {name, email, password, accounts: [], goals: []}
        const response = await this.userService.postCreateUser(newUser);
        if (response == undefined) {
            res.status(400).send({message:"Error"});
        }
        else if (response == false) {
            res.status(409).send({message:"User already exist"});
        }
        else {
            res.status(200).send(response);
        }
    }

    public async postUpdateUserById(req: Request, res: Response){
        const response = await this.userService.postUpdateUserById(req.params.id, req.body);
        if (response == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(response); 
        }; 
    }

    public async getUserById(req: Request, res: Response){
        const response = await this.userService.getUserById(req.params.id);
        if (response == undefined) {
            res.status(400).send({message:"Error"});
        }
        else {
            res.status(200).send(response); 
        };
    }

    public async getUserByEmailAndPasswd(req: Request, res: Response){
        const response = await this.userService.getUserByEmailAndPasswd(req.body.email, req.body.password);
        if (response == undefined) {
            res.status(401).send({message:"Error"});
        }
        else {
            res.status(200).send(response); 
        };
    }
}