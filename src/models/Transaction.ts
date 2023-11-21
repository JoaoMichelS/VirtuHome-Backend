export interface Transaction {
    id: string; // ID único da transação
    accountId: string; // ID da conta associada à transação
    amount: number; // Valor da transação
    type: 'income' | 'expense'; // Tipo de transação (entrada ou saída)
    description: string; // Descrição da transação
    date: Date; // Data da transação
}

export interface TransactionResponse {
    transaction: Transaction | undefined,
    id: string; 
}

