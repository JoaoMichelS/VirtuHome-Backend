import { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../database/firebase";
import { Transaction, TransactionResponse } from "../models/Transaction";
import { documentConverter } from "../utils/DocumentConverter";
import { Account } from "../models/Account";

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
    
    public async findTransactionById(id: string): Promise<Transaction[] | undefined> {
        try {
            const transactionsRef = db.collection('Transaction');
            const querySnapshot = await transactionsRef.where('id', '==', id).get();
            if (querySnapshot.empty) {
                console.log('No matching documents.');
                return undefined;
            } else{
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

    public async updateTransactionById(id: string, newData: any): Promise<Transaction | undefined> {
        try {
          const transactionsRef = db.collection('Transaction');
          const transactionSnapshot = await transactionsRef.where('id', '==', id).get();
        
          if (transactionSnapshot.empty) {
            console.log('Transaction not found.');
            return undefined;
          }
        
          const transactionData = transactionSnapshot.docs[0].data() as Transaction;
          const previousAmount = transactionData.amount; // Valor original antes da edição
          const updatedTransactionData = { ...transactionData, ...newData };
        
          // Atualize a transação com os novos dados
          await transactionSnapshot.docs[0].ref.update(updatedTransactionData);
        
          // Calcule a diferença entre o valor anterior e o novo valor da transação
          const difference = updatedTransactionData.amount - previousAmount;
        
          // Busque o documento da conta associada à transação
          const accountRef = db.collection('Account');
          const accountSnapshot = await accountRef.where('accountId', '==', transactionData.accountId).get();
        
          if (accountSnapshot.empty) {
            console.log('Account not found.');
            return undefined;
          }
        
          if (accountSnapshot.size === 1) {
            const accountData = accountSnapshot.docs[0].data() as Account;
            const currentBalance = accountData.balance;
        
            let updatedBalance = parseFloat(currentBalance);
        
            if (difference !== 0) {
              if (updatedTransactionData.type === 'income') {
                updatedBalance += difference; // Adiciona ao saldo para receitas
              } else {
                updatedBalance -= difference; // Subtrai do saldo para despesas
              }
        
              // Atualize o saldo da conta
              await accountSnapshot.docs[0].ref.update({ balance: updatedBalance });
            }
        
            // Retorna os dados da transação atualizados
            return updatedTransactionData as Transaction;
          } else {
            console.log('Account not found or multiple accounts found for the transaction.');
            return undefined;
          }
        } catch (error) {
          console.error('Error updating transaction:', error);
          return undefined;
        }
      }

      public async deleteTransactionById(id: string): Promise<Transaction | undefined> {
        try {
          const transactionsRef = db.collection('Transaction');
          const transactionSnapshot = await transactionsRef.where('id', '==', id).get();
      
          if (transactionSnapshot.empty) {
            console.log('Transaction not found.');
            return;
          }
      
          const transactionData = transactionSnapshot.docs[0].data() as Transaction;
      
          // Exclua a transação
          await transactionSnapshot.docs[0].ref.delete();
      
          // Busque o documento da conta associada à transação
          const accountRef = db.collection('Account');
          const accountSnapshot = await accountRef.where('accountId', '==', transactionData.accountId).get();
      
          if (accountSnapshot.empty) {
            console.log('Account not found.');
            return;
          }
      
          if (accountSnapshot.size === 1) {
            const accountData = accountSnapshot.docs[0].data() as Account;
            const currentBalance = accountData.balance;
      
            const updatedBalance = parseFloat(currentBalance) - transactionData.amount;
      
            // Atualize o saldo da conta
            await accountSnapshot.docs[0].ref.update({ balance: updatedBalance });
            return transactionData;
          } else {
            console.log('Account not found or multiple accounts found for the transaction.');
            return;
          }
        } catch (error) {
          console.error('Error deleting transaction:', error);
          return;
        }
      }
}