import { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../database/firebase";
import { Goal, GoalResponse } from "../models/Goal";
import { documentConverter } from "../utils/DocumentConverter";
import { Transaction } from "../models/Transaction";
import { GoalService } from "../services/GoalServices";

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
    
    public async updateGoalStatusById(id: string, status: string): Promise<GoalResponse | undefined> {
        try {
            const goalRef = db.collection('Goal').doc(id);
    
            // Atualizar apenas o campo 'status' da meta
            await goalRef.update({ status });
    
            // Recuperar o documento atualizado
            const updatedDoc = await goalRef.get() as DocumentSnapshot<Goal>;
    
            // Retornar o documento atualizado ou undefined se não encontrado
            return this.checkDoc(updatedDoc);
        } catch (error) {
            console.error('Error updating goal status:', error);
            return undefined;
        }
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
                balance: goalData.balance,
                status: goalData.status,
                targetValue: goalData.targetValue,
                startDate: goalData.startDate,
                endDate: goalData.endDate,
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
    
    public async updateGoalById(id: string, newData: any): Promise<Goal | undefined>{
        try{
            const goalsRef = db.collection('Goal');
            const goalSnapshot = await goalsRef.where('id', '==', id).get();

            if (goalSnapshot.empty) {
                console.log('Goal not found.');
                return undefined;
            }

            const goalData = goalSnapshot.docs[0].data() as Goal;
            const updatedGoalData = { ...goalData, ...newData };

            await goalSnapshot.docs[0].ref.update(updatedGoalData);
            return updatedGoalData as Goal;
        } catch (error) {
            console.error('Error updating goal:', error);
            return undefined;
          }
    }

    public async deleteGoalById(goalId: string): Promise<Goal | undefined>{
        try {
            const goalsRef = db.collection('Goal');
            const goalSnapshot = await goalsRef.where('id', '==', goalId).get();
        
            if (goalSnapshot.empty) {
              console.log('Goal not found.');
              return;
            }
        
            const goalData = goalSnapshot.docs[0].data() as Goal;
        
            // Exclua a transação
            await goalSnapshot.docs[0].ref.delete();
            return goalData;
          } catch (error) {
            console.error('Error deleting goal:', error);
            return;
          }
        }
    }
