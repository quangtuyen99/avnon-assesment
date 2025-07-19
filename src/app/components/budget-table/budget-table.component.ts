import { CommonModule } from '@angular/common';
import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BudgetCategory } from '../../models/budget-category.model';
import { FilterByTypePipe } from '../../pipes/budget.pipes';
import { BudgetSignal } from '../../signal/budget.signal';
import { MonthYear } from '../../models/monthYear.model';
import { BudgetHeaderComponent } from '../budget-header/budget-header.component';
import { BudgetCategoryFormComponent } from '../budget-category-form/budget-category-form';
import { CellService } from '../../services/cell.services';

@Component({
    selector: 'budget-table',
    imports: [CommonModule, FormsModule, FilterByTypePipe, BudgetHeaderComponent, BudgetCategoryFormComponent],
    templateUrl: './budget-table.component.html',
    styleUrl: './budget-table.component.css',
})
export class BudgetTableComponent {
    private readonly budgetSignal = inject(BudgetSignal);
    private readonly cellService = inject(CellService);
    
    // Form controls as signals
    public readonly newCategoryName = signal('');
    public readonly newCategoryType = signal<'income' | 'expense'>('income');
    public readonly newCategoryParent = signal<'general' | 'other' | 'operational' | 'salaries'>('general');

    // Period signals
    readonly startPeriodSignal = signal<MonthYear>({ month: 'January', year: 2024 });
    readonly endPeriodSignal = signal<MonthYear>({ month: 'December', year: 2024 });

    // Budget signals
    public readonly budgetCategories = computed(() => this.budgetSignal.budgetCategories$());
    public readonly budgetEntries = computed(() => this.budgetSignal.budgetEntries$());
    public readonly selectedCell = computed(() => this.budgetSignal.selectedCell$());

    private readonly MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    public readonly months = computed(() => {
        const start = this.MONTH_NAMES.indexOf(this.startPeriodSignal().month);
        const end = this.MONTH_NAMES.indexOf(this.endPeriodSignal().month);
        return this.MONTH_NAMES.slice(start, end + 1).map(month => ({
            month,
            year: this.startPeriodSignal().year
        }));
    });

    public readonly availableMonths = computed(() => {
        const currentYear = this.getCurrentYear();
        const years = [currentYear - 1, currentYear, currentYear + 1];
        
        return years.flatMap(year => 
            this.MONTH_NAMES.map(month => ({
                month,
                year
            }))
        );
    });

    constructor() {
        this.startPeriodSignal.set({ month: 'January', year: 2024 });
        this.endPeriodSignal.set({ month: 'December', year: 2024 });
        this.initializeBudgetEntries();
        

        effect(() => {
            const categories = this.budgetCategories();
            const months = this.months();
            if (categories.length > 0 && months.length > 0) {
                this.updateTotals();
            }
        }, { allowSignalWrites: true });
    }

    public getAvailableMonths(): MonthYear[] {
        return this.availableMonths();
    }

    public isValidPeriodSelection(start: MonthYear, end: MonthYear): boolean {
        const startDate = new Date(start.year, this.MONTH_NAMES.indexOf(start.month));
        const endDate = new Date(end.year, this.MONTH_NAMES.indexOf(end.month));
        return startDate <= endDate;
    }

    /**
     * Updates the start and end periods for the budget table.
     * If the new period is invalid, it resets the end period to the start period.
     * @param start The new start period.
     * @param end The new end period.
     */
    public updateDateRange(start: MonthYear, end: MonthYear): void {
        if (!this.isValidPeriodSelection(start, end)) {
            // If invalid selection, reset end to start
            this.endPeriodSignal.set(start);
            return;
        }
        
        this.startPeriodSignal.set(start);
        this.endPeriodSignal.set(end);
        this.initializeBudgetEntries();
    }

    /**
     * Formats the MonthYear object into a readable string.
     * @param monthYear The MonthYear object to format.
     * @returns A string representation of the month and year.
     */
    public formatPeriod(monthYear: MonthYear): string {
        return `${monthYear.month} ${monthYear.year}`;
    }

    /**
     * Initializes the budget entries for the current period.
     * It creates an entry for each month in the selected period with default values.
     */
    private initializeBudgetEntries(): void {
        const entries = this.months().map(({ month }) => ({
            month,
            income: 0,
            expense: 0,
            profitLoss: 0
        }));
        this.budgetSignal.updateEntries(entries);
    }

    /**
     * Updates the totals for income, expense, and profit/loss based on the current budget categories.
     * It recalculates the totals for each month and updates the budget entries accordingly.
     */
    private updateTotals(): void {
        const entries = this.months().map(({ month }) => {
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

    /**
     * Updates the value of a specific cell in the budget table.
     * @param categoryId The ID of the budget category.
     * @param month The month for the budget cell.
     * @param event The input event containing the new value.
     */
    public updateCellValue(categoryId: string, month: string, event: Event): void {
        const value = parseFloat((event.target as HTMLInputElement).value) || 0;
        this.budgetSignal.updateCellValue(categoryId, month, value);
        this.updateTotals();
    }

    /**
     * Handles the selection of a budget cell.
     * @param categoryId The ID of the budget category.
     * @param month The month for the budget cell.
     */
    public onCellSelect(categoryId: string, month: string): void {
        this.cellService.selectCell({ categoryId, month });
    }

    /**
     * Handles the right-click context menu for a budget cell.
     * @param event The mouse event.
     * @param categoryId The ID of the budget category.
     * @param month The month for the budget cell.
     */
    public onRightClick(event: MouseEvent, categoryId: string, month: string): void {
        event.preventDefault();
        const category = this.budgetCategories().find(c => c.id === categoryId);
        if (category) {
            this.cellService.applyValueToAllCells(
                this.budgetCategories(), 
                categoryId, 
                category.values[month]
            );
            this.updateTotals();
        }
    }
    
    /**
     * Adds a new budget category.
     * @param name The name of the category.
     * @param type The type of category ('income' or 'expense').
     * @param parent The parent category ('general', 'other', 'operational', or 'salaries').
     * @returns void
     */
    public addCategory(name: string, type: 'income' | 'expense', parent: 'general' | 'other' | 'operational' | 'salaries'): void {
        if (!name.trim()) return;

        const newCategory: BudgetCategory = {
            id: crypto.randomUUID(),
            name,
            type,
            parent,
            values: Object.fromEntries(this.months().map(({ month }) => [month, 0]))
        };

        this.budgetSignal.addCategory(newCategory);
        this.newCategoryName.set('');
    }

    /**
     * Deletes a budget category.
     * @param categoryId The ID of the category to delete.
     */
    public deleteCategory(categoryId: string): void {
        this.budgetSignal.deleteCategory(categoryId);

        // Queue the update to avoid ExpressionChangedAfterItHasBeenCheckedError
        queueMicrotask(() => {
            this.updateTotals();
        });
    }

    /**
     * Gets the current year.
     * @returns The current year as a number.
     */
    public getCurrentYear(): number {
        return new Date().getFullYear();
    }

    /**
     * Calculates the subtotal for a specific type and parent category for a given month.
     * @param type The type of category ('income' or 'expense').
     * @param parent The parent category to filter by.
     * @param month The month for which to calculate the subtotal.
     * @returns The subtotal for the specified type, parent, and month.
     */
    public getSubTotal(type: 'income' | 'expense', parent: string, month: string): number {
        return this.budgetCategories()
            .filter(c => c.type === type && c.parent === parent)
            .reduce((sum, category) => sum + (category.values[month] || 0), 0);
    }

    /**
     * Calculates the previous balance for a specific month.
     * @param month The month for which to calculate the previous balance.
     * @returns The previous balance for the specified month.
     */
    public getPreviousBalance(month: string): number {
        const monthIndex = this.months().findIndex(m => m.month === month);
        if (monthIndex === 0) return 0;
        
        const prevMonth = this.months()[monthIndex - 1].month;
        const entry = this.budgetEntries().find(e => e.month === prevMonth);
        return entry ? entry.profitLoss : 0;
    }

    /**
     * Calculates the closing balance for a specific month.
     * @param month The month for which to calculate the closing balance.
     * @returns The closing balance for the specified month.
     */
    public getClosingBalance(month: string): number {
        const entry = this.budgetEntries().find(e => e.month === month);
        if (!entry) return 0;
        return this.getPreviousBalance(month) + entry.profitLoss;
    }

    /**
     * Handles keyboard navigation within the budget table.
     * It allows navigation using arrow keys and tabbing through cells.
     * @param event The keyboard event triggered by user actions.
     * @returns void
     */
    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent): void {
        const selectedCell = this.selectedCell();
        if (!selectedCell) return;

        switch (event.key) {
            case 'Tab':
                if (this.cellService.isLastCell(selectedCell)) {
                    event.preventDefault();
                    this.cellService.moveToNextRow(selectedCell, this.budgetCategories());
                }
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
                event.preventDefault();
                this.cellService.navigateCell(
                    event.key.replace('Arrow', '').toLowerCase() as 'left' | 'right' | 'up' | 'down',
                    selectedCell,
                    this.budgetCategories()
                );
                break;
        }
    }
}
