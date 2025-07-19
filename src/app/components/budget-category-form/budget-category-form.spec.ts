import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetCategoryFormComponent } from './budget-category-form';

describe('BudgetCategoryForm', () => {
  let component: BudgetCategoryFormComponent;
  let fixture: ComponentFixture<BudgetCategoryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetCategoryFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetCategoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
