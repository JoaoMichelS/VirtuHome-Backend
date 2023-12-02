import { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../database/firebase";
import { Goal, GoalResponse } from "../models/Goal";
import { documentConverter } from "../utils/DocumentConverter";

export class GoalRepository{
    constructor(){}

    private checkDoc(doc: DocumentSnapshot<Goal>): GoalResponse | undefined {
        if (doc == undefined){return undefined}
        else {return {
            "goal": doc.data(),
            "id": doc.id}};
    }

    private checkDocs(docs: QueryDocumentSnapshot<Goal>[]): Goal[] | undefined {
        try{
            let goals: Goal[] = [];
            docs.forEach(function (doc: QueryDocumentSnapshot<Goal>) {
                goals.push(doc.data());
            })
            return goals;
        } catch { return undefined } ;
    }

    public async updateGoalStatus(goalId: string, transactions: any[]): Promise<GoalResponse | undefined>{
        //const result = (await db.collection('Goal').add(newGoal)).withConverter(documentConverter<Goal>());
        //result.set(newGoal);
        //const doc = await result.get()
        //return this.checkDoc(doc);
        return
    }

    public async createGoal(newGoal: Goal): Promise<GoalResponse | undefined>{
        const result = (await db.collection('Goal').add(newGoal)).withConverter(documentConverter<Goal>());
        result.set(newGoal);
        const doc = await result.get()
        return this.checkDoc(doc);
    }

    public async findGoalById(goalId: string): Promise<GoalResponse | undefined>{
        try {
            const goalsRef = db.collection('Goal');
            const querySnapshot = await goalsRef.where('id', '==', goalId).get();
            if (querySnapshot.empty) {
                console.log('No matching documents.');
                return undefined;
            } else {
                let goalResponse: GoalResponse | undefined;
                querySnapshot.forEach((doc) => {
                    const goalData = doc.data();
                    goalResponse = {
                        goal: goalData as Goal,
                        id: doc.id
                    };
                });
                return goalResponse;
            }
        } catch (error) {
            console.error('Error getting goal by goalId:', error);
            return undefined;
        }
    }

    public async findUserGoals(userId: string): Promise<Goal[] | undefined> {
        try {
          const goalsRef = db.collection('Goal');
          const querySnapshot = await goalsRef.where('userId', '==', userId).get();
      
          if (querySnapshot.empty) {
            console.log('No matching documents.');
            return [];
          } else {
            const goals: Goal[] = [];
            querySnapshot.forEach((doc) => {
              const goalData = doc.data();
              const goal: Goal = {
                id: goalData.id,
                userId: goalData.userId,
                description: goalData.description,
                status: goalData.status,
                monthlyIncome: goalData.monthlyIncome,
                targetValue: goalData.targetValue,
                startDate: goalData.startDate,
                endDate: goalData.endDate,
                spendingCategories: goalData.spendingCategories
              };
              goals.push(goal);
            });
            return goals;
          }
        } catch (error) {
          console.error('Error getting goal by goalId:', error);
          return undefined;
        }
      }

    public async findGoalByStatus(status: boolean): Promise<Goal[] | undefined>{
        const goals = db.collection('Goal').where("status", "==", status).
        withConverter(documentConverter<Goal>());
        const docs = (await goals.get()).docs
        return this.checkDocs(docs);
    }
    
    public async updateGoalById(id: string, data: any): Promise<GoalResponse | undefined>{
        const transaction = db.collection('Goal').doc(id).withConverter(documentConverter<Goal>());
        await transaction.update(data);
        const doc = await transaction.get();
        return this.checkDoc(doc);
    }

    public async deleteGoalById(goalId: string): Promise<GoalResponse | undefined>{
        const goal = db.collection('Goal').doc(goalId).withConverter(documentConverter<Goal>());
        await goal.delete();
        const doc = await goal.get();
        return this.checkDoc(doc); 
    }
}