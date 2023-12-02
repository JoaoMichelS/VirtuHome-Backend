import { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../database/firebase";
import { Transaction, TransactionResponse } from "../models/Transaction";
import { documentConverter } from "../utils/DocumentConverter";

export class TransactionRepository{
    constructor() {}

    private checkDoc(doc: DocumentSnapshot<Transaction>): TransactionResponse | undefined {
        if (doc == undefined){return undefined}
        else {return {"transaction":doc.data(), "id": doc.id}};
    }

    private checkDocs(docs: QueryDocumentSnapshot<Transaction>[]): Transaction[] | undefined {
        try{
            let userTransactions: Transaction[] = [];
            docs.forEach(function (doc: QueryDocumentSnapshot<Transaction>) {
                userTransactions.push(doc.data());
            })
            return userTransactions;
        } catch { return undefined } ;
    }

    public async createTransaction(newTransaction: Transaction): Promise<TransactionResponse | undefined>{
        const result = (await db.collection('Transaction').add(newTransaction)).withConverter(documentConverter<Transaction>());
        result.set(newTransaction);
        const doc = await result.get()
        return this.checkDoc(doc);
    }

    public async findTransactionByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[] | undefined>{
        try {
            const transactionsRef = db.collection('Transaction');
            
            // Faça a consulta utilizando where para filtrar pelo userId e pela data
            const querySnapshot = await transactionsRef
                .where('userId', '==', userId)
                .where('date', '>=', startDate)
                .where('date', '<=', endDate)
                .get();
            
            // Processar os resultados da consulta
            const transactions: Transaction[] = [];
            querySnapshot.forEach((doc) => {
                const transactionData = doc.data() as Transaction;
                const transaction: Transaction = {
                    accountId: transactionData.accountId,
                    amount: transactionData.amount,
                    category: transactionData.category,
                    date: transactionData.date,
                    description: transactionData.description,
                    type: transactionData.type,
                    userId: transactionData.userId,
                    id: transactionData.id
                };
                transactions.push(transaction);
            });
            return transactions;
        } catch (error) {
            console.error('Error getting transactions by date range:', error);
            return undefined;
        }
    }
    
    public async findTransactionById(id: string): Promise<TransactionResponse | undefined>{
        const transaction = db.collection('Transaction').doc(id).withConverter(documentConverter<Transaction>());
        const doc = await transaction.get();
        return this.checkDoc(doc);
    }

    public async findUserTransactions(userId: string): Promise<Transaction[] | undefined>{
        try {
            const transactionsRef = db.collection('Transaction');
            const querySnapshot = await transactionsRef.where('userId', '==', userId).get();
        
            if (querySnapshot.empty) {
              console.log('No matching documents.');
              return [];
            } else {
              const transactions: Transaction[] = [];
              querySnapshot.forEach((doc) => {
                const transactionData = doc.data();
                const transaction: Transaction = {
                    accountId: transactionData.accountId,
                    amount: transactionData.amount,
                    category: transactionData.category,
                    date: transactionData.date,
                    description: transactionData.description,
                    type: transactionData.type,
                    userId: transactionData.userId,
                    id: transactionData.id
                };
                transactions.push(transaction);
              });
              return transactions;
            }
          } catch (error) {
            console.error('Error getting account by accountId:', error);
            return undefined;
          }
    }

    public async findTransactionByStatus(status: boolean): Promise<Transaction[] | undefined>{
        const transactions = db.collection('Transaction').where("status", "==", status).
        withConverter(documentConverter<Transaction>());
        const docs = (await transactions.get()).docs
        return this.checkDocs(docs);
    }

    public async updateTransactionById(id: string, data: any): Promise<TransactionResponse | undefined>{
        const transaction = db.collection('Transaction').doc(id).withConverter(documentConverter<Transaction>());
        await transaction.update(data);
        const doc = await transaction.get();
        return this.checkDoc(doc);
    }

    public async deleteTransactionById(id: string): Promise<TransactionResponse | undefined>{
        const account = db.collection('Transaction').doc(id).withConverter(documentConverter<Transaction>());
        await account.delete();
        const doc = await account.get();
        return this.checkDoc(doc); 
    }
}