import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Wallet } from '../../../core/types/wallet/wallet.type';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { BalanceSplitHelper } from '../../../core/helpers/wallet/balance-split.helper';
import { BALANCE_HERO } from '../../../core/constants/wallet/balance-hero.constant';

@Component({
  selector: 'app-balance-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [RouterLink, CurrencyFormatPipe],
  templateUrl: './balance-hero.component.html'
})
export class BalanceHeroComponent {
  readonly wallet = input.required<Wallet>();
  readonly routes = BALANCE_HERO;
  readonly split = computed(() => BalanceSplitHelper.split({ wallet: this.wallet() }));
}
