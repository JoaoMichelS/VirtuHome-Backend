import { DocumentSnapshot, QuerySnapshot } from "firebase-admin/firestore";
import { db } from "../database/firebase";
import { User, UserResponse } from "../models/User";
import { documentConverter } from "../utils/DocumentConverter";

export class UserRepository{
    constructor () {}

    private checkDoc(doc: DocumentSnapshot<User>): UserResponse | undefined {
        if (doc == undefined){return undefined}
        else {return {
            "name": doc.data()?.name,
            "email": doc.data()?.email,
            "id": doc.id,
            "accounts": doc.data()?.accounts,
            "goals": doc.data()?.goals
        }};
    }

    public async createUser(newUser: User): Promise<UserResponse | undefined>{
        const result = (await db.collection('User').add(newUser)).withConverter(documentConverter<User>());
        result.set(newUser);
        const doc = await result.get()
        return this.checkDoc(doc);
    }

    public async findUserById(id: string): Promise<UserResponse | undefined>{
        const user = db.collection('User').doc(id).withConverter(documentConverter<User>());
        const doc = await user.get();
        return this.checkDoc(doc);
    }

    public async findUserByPassword(password: string): Promise<UserResponse | undefined>{
        const user = db.collection('User').where("password", "==", password).withConverter(documentConverter<User>());
        const doc = (await user.get()).docs[0]
        return this.checkDoc(doc);
    }

    public async findUserByEmail(email: string): Promise<UserResponse | undefined>{
        const user = db.collection('User').where("email", "==", email).withConverter(documentConverter<User>());
        const doc = (await user.get()).docs[0]
        return this.checkDoc(doc);
    }

    public async findUserByEmailAndPasswd(email: string, password: string): Promise<UserResponse | undefined>{
        const user = db.collection('User').where("email", "==", email).where("password", "==", password).
        withConverter(documentConverter<User>());
        const doc = (await user.get()).docs[0]
        return this.checkDoc(doc);
    }

    public async updateUserById(id: string, data: any): Promise<UserResponse | undefined>{
        const user = db.collection('User').doc(id).withConverter(documentConverter<User>());
        await user.update(data);
        const doc = await user.get();
        return this.checkDoc(doc);
    }
}
