import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

export function documentConverter<T extends object>() {
    return {
        toFirestore(arg: T): DocumentData {
            return arg;
        },
        fromFirestore(snapshot: QueryDocumentSnapshot): T{
            return snapshot.data()! as T
        }
    }
}