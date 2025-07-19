import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BudgetCategory } from '../../models/budget-category.model';
import { BudgetEntry } from '../../models/budget-entry.model';

@Component({
    selector: 'budget-table',
    imports: [CommonModule, FormsModule],
    templateUrl: './budget-table.component.html',
    styleUrl: './budget-table.component.css',
})
export class BudgetTableComponent {
    public budgetCategories: BudgetCategory[] = [];
    public budgetEntries: BudgetEntry[] = [];
    public startMonth = 0;
    public endMonth = 11;
    public selectedCell: { categoryId: string; month: string } | null = null;
    public newCategoryName = '';
    public newCategoryType: 'income' | 'expense' = 'income';

    
    constructor() {
        this.initializeBudgetEntries();
    }

    public get months(): string[] {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames.slice(this.startMonth, this.endMonth + 1);
    }

    private initializeBudgetEntries(): void {
        this.budgetEntries = this.months.map(month => ({
            month,
            income: 0,
            expense: 0,
            profitLoss: 0
        }));
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent): void {
        if (!this.selectedCell) return;

        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                this.addCategory(this.newCategoryName, this.newCategoryType);
                break;
            case 'Tab':
                if (this.isLastCell()) {
                    event.preventDefault();
                    this.moveToNextRow();
                }
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
                event.preventDefault();
                //this(event.key);
                break;
        }
    }

    public addCategory(name: string, type: 'income' | 'expense'): void {
        if (!name.trim()) return;

        const newCategory: BudgetCategory = {
            id: crypto.randomUUID(),
            name,
            type,
            values: Object.fromEntries(this.months.map(month => [month, 0]))
        };

        this.budgetCategories.push(newCategory);
        this.updateTotals();
        
        // Reset the form
        // this.newCategoryName = '';
        
        // Select the first cell of the new category
        this.selectedCell = {
            categoryId: newCategory.id,
            month: this.months[0]
        };
    }

    public onCellSelect(categoryId: string, month: string): void {
        this.selectedCell = { categoryId, month };
    }

    private isLastCell(): boolean {
        if (!this.selectedCell) return false;
        const monthIndex = this.months.indexOf(this.selectedCell.month);
        return monthIndex === this.months.length - 1;
    }

    private moveToNextRow(): void {
        if (!this.selectedCell) return;
        const currentIndex = this.budgetCategories.findIndex(c => c.id === this.selectedCell?.categoryId);
        if (currentIndex < this.budgetCategories.length - 1) {
            this.selectedCell = {
                categoryId: this.budgetCategories[currentIndex + 1].id,
                month: this.months[0]
            };
        }
    }

    public onRightClick(event: MouseEvent, categoryId: string, month: string): void {
        event.preventDefault();
        const value = this.budgetCategories.find(c => c.id === categoryId)?.values[month] || 0;
        this.applyToAll(categoryId, value);
    }

    private applyToAll(categoryId: string, value: number): void {
        const category = this.budgetCategories.find(c => c.id === categoryId);
        if (category) {
            this.months.forEach(month => {
                category.values[month] = value;
            });
            this.updateTotals();
        }
    }

    private updateTotals(): void {
        this.months.forEach(month => {
            const totals = this.budgetCategories.reduce(
                (acc, category) => {
                    if (category.type === 'income') {
                        acc.income += category.values[month] || 0;
                    } else {
                        acc.expense += category.values[month] || 0;
                    }
                    return acc;
                },
                { income: 0, expense: 0 }
            );

            const entry = this.budgetEntries.find(e => e.month === month);
            if (entry) {
                entry.income = totals.income;
                entry.expense = totals.expense;
                entry.profitLoss = totals.income - totals.expense;
            }
        });
    }

    public deleteCategory(categoryId: string): void {
        this.budgetCategories = this.budgetCategories.filter(c => c.id !== categoryId);
        this.updateTotals();
    }

    public updateDateRange(start: number, end: number): void {
        this.startMonth = start;
        this.endMonth = end;
        this.initializeBudgetEntries();
        this.updateTotals();
    }
}
