import { BehaviorSubject } from "rxjs";

export class BudgetSignal {
    private budgetSubject = new BehaviorSubject<any>(null);
    
    budget$ = this.budgetSubject.asObservable();

    updateBudget(budget: any) {
        this.budgetSubject.next(budget);
    }

    resetBudget() {
        this.budgetSubject.next(null);
    }
}