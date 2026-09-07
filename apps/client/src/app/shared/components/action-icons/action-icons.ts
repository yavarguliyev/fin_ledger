import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActionIconsConfig } from '../../../core/models/data-table.model';

@Component({
  selector: 'app-action-icons',
  imports: [CommonModule],
  templateUrl: './action-icons.html'
})
export class ActionIconsComponent {
  readonly config = input.required<ActionIconsConfig>();

  readonly viewClick = output<void>();
  readonly createClick = output<void>();
  readonly updateClick = output<void>();
  readonly deleteClick = output<void>();

  onView (): void {
    this.viewClick.emit();
  }

  onCreate (): void {
    this.createClick.emit();
  }

  onUpdate (): void {
    this.updateClick.emit();
  }

  onDelete (): void {
    this.deleteClick.emit();
  }
}
