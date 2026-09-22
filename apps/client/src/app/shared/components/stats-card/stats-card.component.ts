import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatCard } from '../../../core/interfaces/ui/stat-card.interface';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html'
})
export class StatsCardComponent {
  readonly stats = input.required<StatCard[]>();
  readonly columns = input<number>(4);
}
