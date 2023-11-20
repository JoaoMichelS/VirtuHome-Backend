import { Account } from "./Account";

export type User = {
    name: string;
    email: string;
    password: string;
    accounts: Account[];
};

export type UserResponse = {
    name: string | undefined;
    email: string | undefined;
    accounts: Account[] | undefined;
    id: string | undefined;
}