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

    public async VerifyGoal(goalId: string, transactions: Transaction[]): Promise<GoalResponse | undefined> {
        const expensesByCategory: { [category: string]: number } = {};
    
        transactions.forEach((transaction) => {
            const { category, amount } = transaction;
            if (!expensesByCategory[category]) {
                expensesByCategory[category] = 0;
            }
            expensesByCategory[category] += amount;
        });
    
        try {
            const goalResponse = await this.findGoalById(goalId);
    
            if (!goalResponse || !goalResponse.goal) {
                return undefined;
            }
    
            const goal = goalResponse.goal;
            const processedSpendingCategories: { [category: string]: number } = {};

            for (const category in goal.spendingCategories) {
                processedSpendingCategories[category] = goal.spendingCategories[category];
            }
            const exceededCategories = compareExpensesWithGoal(expensesByCategory, processedSpendingCategories);
            // Verificar se existem categorias excedidas
            if (exceededCategories.length > 0) {
                // Atualizar o status do goal para 'abandoned'
                const updatedGoal = await this.updateGoalStatusById(goalId, 'abandoned');
            }
    
            function compareExpensesWithGoal(spending: { [category: string]: number }, goals: { [category: string]: number }): string[] {
                const exceededCategories: string[] = [];
              
                for (const category in spending) {
                  if (category in goals && spending[category] > goals[category]) {
                    exceededCategories.push(category);
                  }
                }
              
                return exceededCategories;
            }
    
            // Aqui você pode realizar outras operações com as categorias excedidas, se necessário
    
            return goalResponse;
        } catch (error) {
            console.error('Error updating goal status:', error);
            return undefined;
        }
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