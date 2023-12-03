import { TransactionRepository } from "../repositories/TransactionRepository";
import { Transaction, TransactionResponse } from "../models/Transaction";

export class TransactionService{
    private readonly transactionRepository: TransactionRepository = new TransactionRepository();

    constructor() {}
    
    public async getUserTransaction(id: string): Promise<Transaction[] | undefined> {
        return this.transactionRepository.findUserTransactions(id);
    }

    public async getTransactionById(id: string): Promise<Transaction[] | undefined> {
        return this.transactionRepository.findTransactionById(id);
    }

    public async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[] | undefined> {
        return this.transactionRepository.findTransactionByDateRange(userId, startDate, endDate);
    }

    public async getUserTransactions(userID: string): Promise<Transaction[] | undefined> {
        return this.transactionRepository.findUserTransactions(userID);
    }

    public async getTransactionByStatus(status: boolean): Promise<Transaction[] | undefined> {
        return this.transactionRepository.findTransactionByStatus(status);
    }

    public async postCreateTransaction(newTransaction: Transaction): Promise<TransactionResponse | undefined> {
        return this.transactionRepository.createTransaction(newTransaction);
    }

    public async postUpdateTransactionById(id: string, data: any): Promise<Transaction | undefined>{
        return this.transactionRepository.updateTransactionById(id, data);
    }

    public async postDeleteTransactionById(id: string): Promise<Transaction | undefined>{
        return this.transactionRepository.deleteTransactionById(id);
    }
}
