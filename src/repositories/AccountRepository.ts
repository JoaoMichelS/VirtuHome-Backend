import { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../database/firebase";
import { Account, AccountResponse } from "../models/Account";
import { documentConverter } from "../utils/DocumentConverter";

export class AccountRepository{
    constructor(){}

    private checkDoc(doc: DocumentSnapshot<Account>): AccountResponse | undefined {
        if (doc == undefined){return undefined}
        else {return {
            "account":doc.data(),
            "id": doc.id,
            "transactions": doc.data()?.transactions}};
    }

    private checkDocs(docs: QueryDocumentSnapshot<Account>[]): Account[] | undefined {
        try{
            let accounts: Account[] = [];
            docs.forEach(function (doc: QueryDocumentSnapshot<Account>) {
                accounts.push(doc.data());
            })
            return accounts;
        } catch { return undefined } ;
    }

    public async createAccount(newAccount: Account): Promise<AccountResponse | undefined>{
        const result = (await db.collection('Account').add(newAccount)).withConverter(documentConverter<Account>());
        result.set(newAccount);
        const doc = await result.get()
        return this.checkDoc(doc);
    }

    public async findAccountById(accountId: string): Promise<AccountResponse | undefined>{
        try {
            const accountsRef = db.collection('Account');
            const querySnapshot = await accountsRef.where('accountId', '==', accountId).get();
    
            if (querySnapshot.empty) {
                console.log('No matching documents.');
                return undefined;
            } else {
                let accountResponse: AccountResponse | undefined;
                querySnapshot.forEach((doc) => {
                    const accountData = doc.data();
                    accountResponse = {
                        account: accountData as Account,
                        transactions: [], // Supondo que as transações serão preenchidas posteriormente
                        id: doc.id
                    };
                });
                return accountResponse;
            }
        } catch (error) {
            console.error('Error getting account by accountId:', error);
            return undefined;
        }
    }

    
    public async findUserAccounts(userId: string): Promise<Account[] | undefined> {
        try {
          const accountsRef = db.collection('Account');
          const querySnapshot = await accountsRef.where('userId', '==', userId).get();
      
          if (querySnapshot.empty) {
            console.log('No matching documents.');
            return [];
          } else {
            const accounts: Account[] = [];
            querySnapshot.forEach((doc) => {
              const accountData = doc.data();
              const account: Account = {
                name: accountData.name,
                userId: accountData.userId,
                balance: accountData.balance,
                status: accountData.status,
                accountId: accountData.accountId,
                transactions: accountData.transactions
              };
              accounts.push(account);
            });
            return accounts;
          }
        } catch (error) {
          console.error('Error getting account by accountId:', error);
          return undefined;
        }
      }

    public async findAccountByStatus(status: boolean): Promise<Account[] | undefined>{
        const accounts = db.collection('Account').where("status", "==", status).
        withConverter(documentConverter<Account>());
        const docs = (await accounts.get()).docs
        return this.checkDocs(docs);
    }

    public async updateAccountById(accountId: string, data: any): Promise<AccountResponse | undefined>{
        try {
            const accountsRef = db.collection('Account');
            const querySnapshot = await accountsRef.where('accountId', '==', accountId).get();
    
            if (querySnapshot.empty) {
                console.log('No matching documents.');
                return undefined;
            } else {
                let accountResponse: AccountResponse | undefined;
                querySnapshot.forEach(async (doc) => {
                    await doc.ref.update(data);
                    const updatedDoc = await doc.ref.get();
                    const accountData = updatedDoc.data();
                    accountResponse = {
                        account: accountData as Account,
                        transactions: [], // Supondo que as transações serão preenchidas posteriormente
                        id: updatedDoc.id
                    };
                });
                return accountResponse;
            }
        } catch (error) {
            console.error('Error updating account by accountId:', error);
            return undefined;
        }
    }

    public async deleteAccountById(accountId: string): Promise<AccountResponse | undefined>{
        const account = db.collection('Account').doc(accountId).withConverter(documentConverter<Account>());
        await account.delete();
        const doc = await account.get();
        return this.checkDoc(doc); 
    }
}