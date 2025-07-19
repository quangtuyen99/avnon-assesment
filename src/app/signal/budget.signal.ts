import { BehaviorSubject } from "rxjs";
import { BudgetCategory } from "../models/budget-category.model";
import { BudgetEntry } from "../models/budget-entry.model";
import { signal } from "@angular/core";

export class BudgetSignal {
    private readonly budgetCategories = signal<BudgetCategory[]>([]);
    private readonly budgetEntries = signal<BudgetEntry[]>([]);
    private readonly selectedCell = signal<{ categoryId: string; month: string } | null>(null);

    public readonly budgetCategories$ = this.budgetCategories.asReadonly();
    public readonly budgetEntries$ = this.budgetEntries.asReadonly();
    public readonly selectedCell$ = this.selectedCell.asReadonly();

    updateCategories(categories: BudgetCategory[]) {
        this.budgetCategories.set(categories);
    }

    addCategory(category: BudgetCategory) {
        this.budgetCategories.update(categories => [...categories, category]);
    }

    deleteCategory(categoryId: string) {
        this.budgetCategories.update(categories => 
            categories.filter(c => c.id !== categoryId)
        );
    }

    updateCellValue(categoryId: string, month: string, value: number) {
        this.budgetCategories.update(categories => 
            categories.map(category => 
                category.id === categoryId 
                    ? { 
                        ...category, 
                        values: { ...category.values, [month]: value } 
                    }
                    : category
            )
        );
    }

    updateEntries(entries: BudgetEntry[]) {
        this.budgetEntries.set(entries);
    }

    setSelectedCell(cell: { categoryId: string; month: string } | null) {
        this.selectedCell.set(cell);
    }
}