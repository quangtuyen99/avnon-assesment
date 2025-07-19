import { CommonModule } from '@angular/common';
import { Component, computed, effect, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BudgetCategory } from '../../models/budget-category.model';
import { BudgetEntry } from '../../models/budget-entry.model';
import { FilterByTypePipe } from '../../pipes/budget.pipes';
import { BudgetSignal } from '../../signal/budget.signal';

@Component({
    selector: 'budget-table',
    imports: [CommonModule, FormsModule, FilterByTypePipe],
    templateUrl: './budget-table.component.html',
    styleUrl: './budget-table.component.css',
})
export class BudgetTableComponent {
    public startMonth = 0;
    public endMonth = 11;
    public newCategoryName = '';
    public newCategoryType: 'income' | 'expense' = 'income';

    public readonly budgetCategories!: () => BudgetCategory[];
    public readonly budgetEntries!: () => BudgetEntry[];
    public readonly selectedCell!: () => { categoryId: string; month: string } | null;

    public readonly months = computed(() => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames.slice(this.startMonth, this.endMonth + 1);
    });

    constructor(private budgetSignal: BudgetSignal) {
        this.budgetCategories = this.budgetSignal.budgetCategories$;
        this.budgetEntries = this.budgetSignal.budgetEntries$;
        this.selectedCell = this.budgetSignal.selectedCell$;

        this.initializeBudgetEntries();

        effect(() => {
            const categories = this.budgetCategories();
            if (categories.length > 0) {
                this.updateTotals();
            }
        });
    }

    private initializeBudgetEntries(): void {
        const entries = this.months().map(month => ({
            month,
            income: 0,
            expense: 0,
            profitLoss: 0
        }));
        this.budgetSignal.updateEntries(entries);
    }

    public updateCellValue(categoryId: string, month: string, event: Event): void {
        const value = parseFloat((event.target as HTMLInputElement).value) || 0;
        this.budgetSignal.updateCellValue(categoryId, month, value);
    }

    public onCellSelect(categoryId: string, month: string): void {
        this.budgetSignal.setSelectedCell({ categoryId, month });
    }

    public updateDateRange(start: number, end: number): void {
        this.startMonth = start;
        this.endMonth = end;
        this.initializeBudgetEntries();
    }

    public onRightClick(event: MouseEvent, categoryId: string, month: string): void {
        event.preventDefault();
        const category = this.budgetCategories().find(c => c.id === categoryId);
        if (category) {
            const value = category.values[month];
            this.applyToAll(categoryId, value);
        }
    }

    private applyToAll(categoryId: string, value: number): void {
        this.months().forEach(month => {
            this.budgetSignal.updateCellValue(categoryId, month, value);
        });
    }

    public addCategory(name: string, type: 'income' | 'expense'): void {
        if (!name.trim()) return;

        const newCategory: BudgetCategory = {
            id: crypto.randomUUID(),
            name,
            type,
            values: Object.fromEntries(this.months().map(month => [month, 0]))
        };

        this.budgetSignal.addCategory(newCategory);
        this.newCategoryName = '';
    }

    public deleteCategory(categoryId: string): void {
        this.budgetSignal.deleteCategory(categoryId);
    }

    private updateTotals(): void {
        const entries = this.months().map(month => {
            const totals = this.budgetCategories().reduce(
                (acc, category) => {
                    const value = category.values[month] || 0;
                    if (category.type === 'income') {
                        acc.income += value;
                    } else {
                        acc.expense += value;
                    }
                    return acc;
                },
                { income: 0, expense: 0 }
            );

            return {
                month,
                income: totals.income,
                expense: totals.expense,
                profitLoss: totals.income - totals.expense
            };
        });

        this.budgetSignal.updateEntries(entries);
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent): void {
        if (!this.selectedCell()) return;

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
                this.navigateCell(event.key);
                break;
        }
    }

    private isLastCell(): boolean {
        const cell = this.selectedCell();
        if (!cell) return false;
        return this.months()[this.months().length - 1] === cell.month;
    }

    private moveToNextRow(): void {
        const cell = this.selectedCell();
        if (!cell) return;
        
        const currentIndex = this.budgetCategories().findIndex(c => c.id === cell.categoryId);
        const categories = this.budgetCategories();
        
        if (currentIndex < categories.length - 1) {
            this.budgetSignal.setSelectedCell({
                categoryId: categories[currentIndex + 1].id,
                month: this.months()[0]
            });
        }
    }

    private navigateCell(direction: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'): void {
        const cell = this.selectedCell();
        if (!cell) return;

        const categories = this.budgetCategories();
        const months = this.months();
        
        const currentCategoryIndex = categories.findIndex(c => c.id === cell.categoryId);
        const currentMonthIndex = months.indexOf(cell.month);

        let newCategoryIndex = currentCategoryIndex;
        let newMonthIndex = currentMonthIndex;

        switch (direction) {
            case 'ArrowLeft':
                newMonthIndex = Math.max(0, currentMonthIndex - 1);
                break;
            case 'ArrowRight':
                newMonthIndex = Math.min(months.length - 1, currentMonthIndex + 1);
                break;
            case 'ArrowUp':
                newCategoryIndex = Math.max(0, currentCategoryIndex - 1);
                break;
            case 'ArrowDown':
                newCategoryIndex = Math.min(categories.length - 1, currentCategoryIndex + 1);
                break;
        }

        if (categories[newCategoryIndex]) {
            this.budgetSignal.setSelectedCell({
                categoryId: categories[newCategoryIndex].id,
                month: months[newMonthIndex]
            });
        }
    }
}
