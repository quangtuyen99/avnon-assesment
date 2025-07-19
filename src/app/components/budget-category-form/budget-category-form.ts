import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'budget-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mt-4 flex gap-4 items-center">
      <input 
        type="text" 
        [ngModel]="categoryName"
        (ngModelChange)="categoryNameChange.emit($event)"
        placeholder="New category name"
        class="border rounded p-2 flex-1"
      >
      <select 
        [ngModel]="categoryType"
        (ngModelChange)="categoryTypeChange.emit($event)"
        class="border rounded p-2">
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <select 
        [ngModel]="categoryParent"
        (ngModelChange)="categoryParentChange.emit($event)"
        class="border rounded p-2">
        <option value="general">General</option>
        <option value="other">Other</option>
        <option value="operational">Operational</option>
        <option value="salaries">Salaries</option>
      </select>
      <button 
        (click)="onAddCategory()"
        [disabled]="!categoryName.trim()"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
        Add Category
      </button>
    </div>
  `,
  styles: [`
    .disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class BudgetCategoryFormComponent {
    @Input() categoryName = '';
    @Input() categoryType: 'income' | 'expense' = 'income';
    @Input() categoryParent: 'general' | 'other' | 'operational' | 'salaries' = 'general';

    @Output() categoryNameChange = new EventEmitter<string>();
    @Output() categoryTypeChange = new EventEmitter<'income' | 'expense'>();
    @Output() categoryParentChange = new EventEmitter<'general' | 'other' | 'operational' | 'salaries'>();
    @Output() addCategory = new EventEmitter<{
      name: string;
      type: 'income' | 'expense';
      parent: 'general' | 'other' | 'operational' | 'salaries';
    }>();

    /**
     * Handles the addition of a new budget category.
     * Emits the category details if the name is not empty.
     */
    onAddCategory(): void {
        if (!this.categoryName.trim()) return;

        this.addCategory.emit({
            name: this.categoryName,
            type: this.categoryType,
            parent: this.categoryParent
        });
    }
}
