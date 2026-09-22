import { Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WalletService } from '../../core/services/wallet.service';
import { ToastService } from '../../core/services/toast.service';
import { Wallet } from '../../core/interfaces/wallet/wallet.interface';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-wallet-switcher',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './templates/wallet-switcher.component.html'
})
export class WalletSwitcherComponent {
  private readonly walletService = inject(WalletService);
  private readonly toast = inject(ToastService);

  readonly walletChange = output<Wallet>();

  readonly wallets = this.walletService.wallets;
  readonly activeWalletId = computed(() => this.walletService.wallet()?.id);
  readonly openableCurrencies = signal<string[]>([]);
  readonly opening = signal(false);

  select (wallet: Wallet): void {
    this.walletService.selectWallet(wallet.id);
    this.walletChange.emit(wallet);
  }

  showOpenableCurrencies (): void {
    this.walletService.getOpenableCurrencies().subscribe(codes => this.openableCurrencies.set(codes));
  }

  open (currency: string): void {
    this.opening.set(true);

    this.walletService.openWallet(currency).subscribe({
      next: wallet => {
        this.opening.set(false);
        this.openableCurrencies.set([]);
        this.toast.success(`${currency} wallet opened`);
        this.walletChange.emit(wallet);
      },
      error: (err: Error) => {
        this.opening.set(false);
        this.toast.error(err.message);
      }
    });
  }
}
