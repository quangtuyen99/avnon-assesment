// filepath: /Users/tuyenpham/Angular/avnon-assesment/src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetTableComponent } from './components/budget-table/budget-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BudgetTableComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Budget Builder';
}