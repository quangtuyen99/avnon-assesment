import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CellPosition {
  categoryId: string;
  month: string;
}

@Injectable({
  providedIn: 'root'
})
export class CellService {
    private selectedCell = new BehaviorSubject<CellPosition | null>(null);
    private readonly MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    get selectedCell$(): Observable<CellPosition | null> {
        return this.selectedCell.asObservable();
    }

    selectCell(position: CellPosition): void {
        this.selectedCell.next(position);
    }

    clearSelection(): void {
        this.selectedCell.next(null);
    }

    navigateCell(direction: 'left' | 'right' | 'up' | 'down', currentPosition: CellPosition, categories: any[]): void {
        const currentCategoryIndex = categories.findIndex(c => c.id === currentPosition.categoryId);
        const currentMonthIndex = this.MONTH_NAMES.indexOf(currentPosition.month);

        let newCategoryIndex = currentCategoryIndex;
        let newMonthIndex = currentMonthIndex;

        switch (direction) {
        case 'left':
            newMonthIndex = Math.max(0, currentMonthIndex - 1);
            break;
        case 'right':
            newMonthIndex = Math.min(this.MONTH_NAMES.length - 1, currentMonthIndex + 1);
            break;
        case 'up':
            newCategoryIndex = Math.max(0, currentCategoryIndex - 1);
            break;
        case 'down':
            newCategoryIndex = Math.min(categories.length - 1, currentCategoryIndex + 1);
            break;
        }

        if (categories[newCategoryIndex]) {
        this.selectCell({
            categoryId: categories[newCategoryIndex].id,
            month: this.MONTH_NAMES[newMonthIndex]
        });
        }
    }

    applyValueToAllCells(categories: any[], categoryId: string, value: number): void {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
        this.MONTH_NAMES.forEach(month => {
            category.values[month] = value;
        });
        }
    }

    isLastCell(position: CellPosition): boolean {
        return position.month === this.MONTH_NAMES[this.MONTH_NAMES.length - 1];
    }

    moveToNextRow(position: CellPosition, categories: any[]): void {
        const currentIndex = categories.findIndex(c => c.id === position.categoryId);
        
        if (currentIndex < categories.length - 1) {
        this.selectCell({
            categoryId: categories[currentIndex + 1].id,
            month: this.MONTH_NAMES[0]
        });
        }
    }
}