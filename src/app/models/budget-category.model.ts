export interface BudgetCategory {
    id: string;
    name: string;
    type: 'income' | 'expense';
    parentCategory?: string;
    values: { [month: string]: number };
}