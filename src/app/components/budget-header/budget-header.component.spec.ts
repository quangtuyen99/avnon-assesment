import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetHeaderComponent } from './budget-header.component';

describe('BudgetHeaderComponent', () => {
  let component: BudgetHeaderComponent;
  let fixture: ComponentFixture<BudgetHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
