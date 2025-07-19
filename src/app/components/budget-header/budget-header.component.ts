import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonthYear } from '../../models/monthYear.model';

@Component({
  selector: 'budget-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-4 flex gap-4">
      <div class="flex items-center gap-2">
        <label class="font-semibold">Start Period:</label>
        <select 
          [ngModel]="startPeriod"
          (ngModelChange)="onStartPeriodChange($event)"
          class="border rounded p-2">
          <option *ngFor="let period of availableMonths()" 
                  [ngValue]="period">
            {{formatPeriod(period)}}
          </option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="font-semibold">End Period:</label>
        <select 
          [ngModel]="endPeriod"
          (ngModelChange)="onEndPeriodChange($event)"
          class="border rounded p-2">
          <option *ngFor="let period of availableMonths()" 
                  [ngValue]="period"
                  [disabled]="!isValidPeriodSelection(startPeriod, period)">
            {{formatPeriod(period)}}
          </option>
        </select>
      </div>
    </div>
  `
})
export class BudgetHeaderComponent {
    @Input({ required: true }) startPeriod!: MonthYear;
    @Input({ required: true }) endPeriod!: MonthYear;
    @Output() periodChange = new EventEmitter<{ start: MonthYear, end: MonthYear }>();

    /**
     * List of month names used for display and selection.
     */
    private readonly MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    /**
     * Computes the available months for the budget header based on the current year.
     * It generates a list of MonthYear objects for the last, current, and next year.
     */
    public readonly availableMonths = computed(() => {
        const currentYear = new Date().getFullYear();
        const years = [currentYear - 1, currentYear, currentYear + 1];
        return years.flatMap(year => 
            this.MONTH_NAMES.map(month => ({ month, year }))
        );
    });

    /**
     * Handles the change of the start period and emits the new period.
     * @param newStart The new start period selected by the user.
     */
    public onStartPeriodChange(newStart: MonthYear): void {
        this.periodChange.emit({ 
            start: newStart, 
            end: this.endPeriod 
        });
    }

    /**
     * Handles the change of the end period and emits the new period.
     * @param newEnd The new end period selected by the user.
     */
    public onEndPeriodChange(newEnd: MonthYear): void {
        this.periodChange.emit({ 
            start: this.startPeriod, 
            end: newEnd 
        });
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
     * Checks if the selected period is valid.
     * @param start The start period.
     * @param end The end period.
     * @returns True if the period selection is valid, false otherwise.
     */
    public isValidPeriodSelection(start: MonthYear, end: MonthYear): boolean {
        const startDate = new Date(start.year, this.MONTH_NAMES.indexOf(start.month));
        const endDate = new Date(end.year, this.MONTH_NAMES.indexOf(end.month));
        return startDate <= endDate;
    }
}