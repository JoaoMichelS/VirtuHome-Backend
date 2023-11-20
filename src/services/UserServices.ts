import { UserRepository } from "../repositories/UserRepository";
import { User, UserResponse } from "../models/User";

export class UserService{
    private readonly userRepository: UserRepository = new UserRepository();

    constructor () {}

    public async getUserById(id: string): Promise<UserResponse | undefined> {
        return this.userRepository.findUserById(id);
    }

    public async getUserByEmailAndPasswd(email:string, password: string): Promise<UserResponse | undefined> {
        return this.userRepository.findUserByEmailAndPasswd(email, password);
    }

    public async postCreateUser(newUser: User): Promise<UserResponse | undefined | boolean> {
        const user_check = await this.userRepository.findUserByEmail(newUser.email);
        if (user_check == undefined){
            const user_check = await this.userRepository.findUserByEmailAndPasswd(newUser.email, newUser.password);
            if (user_check == undefined){
                return this.userRepository.createUser(newUser);
            }
        }
        return false
    }

    public async postUpdateUserById(id: string, data: any): Promise<UserResponse | undefined>{
        return this.userRepository.updateUserById(id, data);
    }
}
