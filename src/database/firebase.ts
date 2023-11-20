import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from 'firebase-admin/firestore';
import myToken from './virtuhome-b701e-fa259670713a.json'

initializeApp({credential: cert(myToken as ServiceAccount)});
export const db = getFirestore();
