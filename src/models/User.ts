import { Account } from "./Account";
import { Goal } from "./Goal";

export type User = {
    name: string;
    email: string;
    password: string;
    accounts: Account[];
    goals: Goal[];
};

export type UserResponse = {
    name: string | undefined;
    email: string | undefined;
    accounts: Account[] | undefined;
    goals: Goal[] | undefined;
    id: string | undefined;
}