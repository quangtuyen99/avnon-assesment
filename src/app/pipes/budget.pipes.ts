import { Pipe, PipeTransform } from '@angular/core';
import { BudgetCategory } from '../models/budget-category.model';

@Pipe({
    name: 'filterByType',
    standalone: true
})
export class FilterByTypePipe implements PipeTransform {
    transform(categories: BudgetCategory[], type: 'income' | 'expense'): BudgetCategory[] {
        return categories.filter(category => category.type === type);
    }
}