export interface CellValue {
  value: number;
  categoryId: string;
  month: string;
}

export interface CellNavigationEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  currentPosition: CellPosition;
}

export interface CellPosition {
  categoryId: string;
  month: string;
}