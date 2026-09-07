import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle.component.html'
})
export class ToggleComponent {
  readonly checked = input.required<boolean>();
  readonly disabled = input<boolean>(false);
  readonly id = input<string>(`toggle-${Math.random().toString(36).substr(2, 9)}`);
  
  readonly toggleChange = output<boolean>();

  onToggle (event: Event): void {
    const target = event.target as HTMLInputElement;
    this.toggleChange.emit(target.checked);
  }
}
