import { AccountRepository } from "../repositories/AccountRepository";
import { Account, AccountResponse } from "../models/Account";


export class AccountService{
    private readonly accountRepository: AccountRepository = new AccountRepository();

    constructor() {}

    public async getAccountById(id: string): Promise<AccountResponse | undefined> {
        return this.accountRepository.findAccountById(id);
    }

    public async getUserAccounts(userID: string): Promise<Account[] | undefined> {
        return this.accountRepository.findUserAccounts(userID);
    }

    public async getAccountByStatus(status: boolean): Promise<Account[] | undefined> {
        return this.accountRepository.findAccountByStatus(status);
    }

    public async postCreateAccount(newAccount: Account): Promise<AccountResponse | undefined> {
        return this.accountRepository.createAccount(newAccount);
    }

    public async postDeleteCallById(id: string): Promise<AccountResponse | undefined>{
        return this.accountRepository.deleteAccountById(id);
    }

}