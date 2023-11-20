export type Account = {
    name: string;
    balance: number;
    status: boolean;
    userId: string;
    accountId: string;
};

export type AccountResponse = {
    account: Account | undefined,
    id: string
}