import { Transaction } from "./Transaction";

export type Account = {
    name: string;
    balance: string;
    status: boolean;
    userId: string;
    accountId: string;
    transactions: Transaction[];
};

export type AccountResponse = {
    account: Account | undefined;
    transactions: Transaction[] | undefined;
    id: string;
}