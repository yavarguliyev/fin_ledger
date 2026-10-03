import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TOGGLE } from '../../../core/constants/ui/toggle.constant';
import { ToggleVariant } from '../../../core/types/ui/toggle-variant.type';

@Component({
  selector: 'app-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './toggle.component.html'
})
export class ToggleComponent {
  readonly checked = input.required<boolean>();
  readonly disabled = input<boolean>(false);
  readonly label = input<string | null>(null);
  readonly variant = input<ToggleVariant>(TOGGLE.STATUS);
  readonly preference = TOGGLE.PREFERENCE;
  readonly animated = signal(false);
  readonly id = input<string>(`toggle-${Math.random().toString(36).substr(2, 9)}`);

  readonly toggleChange = output<boolean>();

  enableAnimation (): void {
    this.animated.set(true);
  }

  onToggle (event: Event): void {
    const target = event.target as HTMLInputElement;
    this.toggleChange.emit(target.checked);
  }
}
