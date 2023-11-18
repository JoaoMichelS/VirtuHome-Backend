import { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../database/firebase";
import { Call, CallReponse } from "../models/Call";
import { documentConverter } from "../utils/DocumentConverter";

export class CallRepository{
    constructor() {}

    private checkDoc(doc: DocumentSnapshot<Call>): CallReponse | undefined {
        if (doc == undefined){return undefined}
        else {return {"call":doc.data(), "id": doc.id}};
    }

    private checkDocs(docs: QueryDocumentSnapshot<Call>[]): Call[] | undefined {
        try{
            let userCalls: Call[] = [];
            docs.forEach(function (doc: QueryDocumentSnapshot<Call>) {
                userCalls.push(doc.data());
            })
            return userCalls;
        } catch { return undefined } ;
    }

    public async createCall(newCall: Call): Promise<CallReponse | undefined>{
        const result = (await db.collection('Call').add(newCall)).withConverter(documentConverter<Call>());
        result.set(newCall);
        const doc = await result.get()
        return this.checkDoc(doc);
    }

    public async findCallById(id: string): Promise<CallReponse | undefined>{
        const call = db.collection('Call').doc(id).withConverter(documentConverter<Call>());
        const doc = await call.get();
        return this.checkDoc(doc);
    }

    public async findUserCalls(userID: string): Promise<Call[] | undefined>{
        const calls = db.collection('Call').where("userID", "==", userID).
        withConverter(documentConverter<Call>());
        const docs = (await calls.get()).docs
        return this.checkDocs(docs);
    }

    public async findCallByStatus(status: boolean): Promise<Call[] | undefined>{
        const calls = db.collection('Call').where("status", "==", status).
        withConverter(documentConverter<Call>());
        const docs = (await calls.get()).docs
        return this.checkDocs(docs);
    }

    public async updateCallById(id: string, data: any): Promise<CallReponse | undefined>{
        const call = db.collection('Call').doc(id).withConverter(documentConverter<Call>());
        await call.update(data);
        const doc = await call.get();
        return this.checkDoc(doc);
    }

    public async deleteCallById(id: string): Promise<CallReponse | undefined>{
        const call = db.collection('Call').doc(id).withConverter(documentConverter<Call>());
        await call.update({
            status: false
        })
        const doc = await call.get();
        return this.checkDoc(doc);
    }
}