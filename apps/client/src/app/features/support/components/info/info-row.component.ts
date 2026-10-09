import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-info-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../../templates/info/info-row.component.html'
})
export class InfoRowComponent {
  readonly label = input.required<string>();
  readonly value = input<string | number | null>(null);
  readonly tone = input<'default' | 'accent' | 'danger'>('default');
  readonly chevron = input(true);
  readonly pressed = output();
}
