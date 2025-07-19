export interface BudgetCategory {
    id: string;
    name: string;
    type: 'income' | 'expense';
    parent: 'general' | 'other' | 'operational' | 'salaries';
    values: { [month: string]: number };
}