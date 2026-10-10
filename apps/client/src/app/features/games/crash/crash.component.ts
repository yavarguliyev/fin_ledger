import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';

import { CRASH_GAME } from '../../../core/constants/games/crash.constant';
import { CrashStakeHelper } from '../../../core/helpers/games/crash-stake.helper';
import { CurrencyHelper } from '../../../core/helpers/wallet/currency.helper';
import { WalletService } from '../../../core/services/wallet.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RocketComponent } from '../../../shared/components/rocket/rocket.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-crash',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, RocketComponent, CurrencyFormatPipe],
  templateUrl: './templates/crash.component.html'
})
export class CrashComponent {
  private readonly walletService = inject(WalletService);

  readonly view = CRASH_GAME;
  readonly stake = signal<number>(CRASH_GAME.DEFAULT_STAKE);
  readonly currency = computed(() => this.walletService.wallet()?.currency ?? CRASH_GAME.FALLBACK_CURRENCY);
  readonly potentialMinor = computed(() => CurrencyHelper.toMinor({ amount: this.stake() * CRASH_GAME.TARGET_MULTIPLIER, currency: this.currency() }));
  readonly stakeText = computed(() => this.stake().toFixed(2));

  onStakeInput (event: Event): void {
    this.stake.set(CrashStakeHelper.parse((event.target as HTMLInputElement).value));
  }

  quick (action: string): void {
    this.stake.set(CrashStakeHelper.apply({ stake: this.stake(), action }));
  }
}
