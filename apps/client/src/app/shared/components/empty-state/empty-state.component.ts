import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html'
})
export class EmptyStateComponent {
  readonly icon = input<string>('');
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly actionLabel = input<string>('');
  readonly action = output();
}
