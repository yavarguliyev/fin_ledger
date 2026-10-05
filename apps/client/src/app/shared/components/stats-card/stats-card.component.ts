import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatCard } from '../../../core/interfaces/ui/stat-card.interface';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html'
})
export class StatsCardComponent {
  readonly stats = input.required<StatCard[]>();
  readonly columns = input<number>(4);
  readonly choose = output<string>();
}
