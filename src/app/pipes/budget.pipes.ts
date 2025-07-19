import { Pipe, PipeTransform } from '@angular/core';
import { BudgetCategory } from '../models/budget-category.model';

@Pipe({
    name: 'filterByType',
    standalone: true
})
export class FilterByTypePipe implements PipeTransform {
    transform(categories: BudgetCategory[], type: 'income' | 'expense', parent?: string): BudgetCategory[] {
        return categories.filter(category => {
            const typeMatch = category.type === type;
            return parent ? typeMatch && category.parent === parent : typeMatch;
        });
    }
}