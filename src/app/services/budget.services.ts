export class BudgetService {
    private budgetEntries: any[] = [];

    constructor() {}

    addEntry(entry: any): void {
        this.budgetEntries.push(entry);
    }

    updateEntry(index: number, updatedEntry: any): void {
        if (index >= 0 && index < this.budgetEntries.length) {
            this.budgetEntries[index] = updatedEntry;
        }
    }

    deleteEntry(index: number): void {
        if (index >= 0 && index < this.budgetEntries.length) {
            this.budgetEntries.splice(index, 1);
        }
    }

    getEntries(): any[] {
        return this.budgetEntries;
    }

    calculateTotal(): number {
        return this.budgetEntries.reduce((total, entry) => total + entry.amount, 0);
    }
}