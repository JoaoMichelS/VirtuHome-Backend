import { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../database/firebase";
import { Account, AccountResponse } from "../models/Account";
import { documentConverter } from "../utils/DocumentConverter";

export class AccountRepository{
    constructor(){}

    private checkDoc(doc: DocumentSnapshot<Account>): AccountResponse | undefined {
        if (doc == undefined){return undefined}
        else {return {"account":doc.data(), "id": doc.id}};
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

    public async findAccountById(id: string): Promise<AccountResponse | undefined>{
        const account = db.collection('Account').doc(id).withConverter(documentConverter<Account>());
        const doc = await account.get();
        return this.checkDoc(doc);
    }

    public async findUserAccounts(userID: string): Promise<Account[] | undefined>{
        const accounts = db.collection('Account').where("userID", "==", userID).
        withConverter(documentConverter<Account>());
        const docs = (await accounts.get()).docs
        return this.checkDocs(docs);
    }

    public async findAccountByStatus(status: boolean): Promise<Account[] | undefined>{
        const accounts = db.collection('Account').where("status", "==", status).
        withConverter(documentConverter<Account>());
        const docs = (await accounts.get()).docs
        return this.checkDocs(docs);
    }

    public async updateAccountById(id: string, data: any): Promise<AccountResponse | undefined>{
        const account = db.collection('Account').doc(id).withConverter(documentConverter<Account>());
        await account.update(data);
        const doc = await account.get();
        return this.checkDoc(doc);
    }

    public async deleteAccountById(id: string): Promise<AccountResponse | undefined>{
        const account = db.collection('Account').doc(id).withConverter(documentConverter<Account>());
        await account.delete();
        const doc = await account.get();
        return this.checkDoc(doc); 
    }




}