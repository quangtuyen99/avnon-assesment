import { Component } from '@angular/core';

@Component({
  selector: 'context-menu',
  imports: [],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.css'
})
export class ContextMenuComponent {
    // Logic for handling context menu actions
    constructor() {}

    // Method to handle the 'Apply to all' action
    applyToAll() {
        // Implementation for applying the value to all corresponding cells
    }

    deleteRow() {
        
    }

    // Additional methods for context menu functionality can be added here
}
