import { Injectable, signal, inject } from '@angular/core';

import { WalletService } from '../../../core/services/wallet.service';
import { ShowMoreConfig } from '../../../core/models/base.mode';
import { FormState, VisibleImages } from '../../../core/models/auth.model';

@Injectable()
export class ProfileFormService {
  private readonly walletService = inject(WalletService);
  private readonly initialFormValue = signal<FormState | null>(null);
  readonly isFormChanged = signal(false);
  readonly imagesPage = signal(1);
  readonly imagesPageSize = signal(2);

  setFormChanged (changed: boolean): void {
    this.isFormChanged.set(changed);
  }

  resetChanged (): void {
    this.isFormChanged.set(false);
  }

  loadMoreImages (): void {
    this.imagesPage.update(page => page + 1);
  }

  resetImagesPage (): void {
    this.imagesPage.set(1);
  }

  setInitialValue (displayName: string, currency: string): void {
    this.initialFormValue.set({ displayName, currency });
  }

  getVisibleImages (allImages: Array<VisibleImages>): Array<VisibleImages> {
    return allImages.slice(0, this.imagesPage() * this.imagesPageSize());
  }

  getShowMoreConfig (totalItems: number): ShowMoreConfig {
    return { pageSize: this.imagesPageSize(), currentPage: this.imagesPage(), totalItems };
  }

  checkIfChanged (currentDisplayName: string | null | undefined, currentCurrency: string | null | undefined): void {
    const initial = this.initialFormValue();
    if (!initial) return;
    this.isFormChanged.set(currentDisplayName !== initial.displayName || currentCurrency !== initial.currency);
  }

  refreshWalletCurrency (walletId: string, onUpdate: (currency: string) => void): void {
    this.walletService.getWallet(walletId).subscribe({
      next: () => {
        const wallet = this.walletService.wallet();
        if (wallet) onUpdate(wallet.currency);
      }
    });
  }

  loadWallet (walletId: string | null | undefined, onSuccess: (currency: string, createdAt: string) => void, onNoWallet: () => void): void {
    if (!walletId) {
      onNoWallet();
      return;
    }

    this.walletService.getWallet(walletId).subscribe({
      next: () => {
        const wallet = this.walletService.wallet();
        if (wallet) onSuccess(wallet.currency, wallet.createdAt);
      }
    });
  }

  updateWalletInfo (
    currency: string,
    createdAt: string,
    displayName: string,
    setCurrency: (val: string) => void,
    setCreatedAt: (val: string) => void,
    setCurrencyControl: (val: string) => void
  ): void {
    setCurrency(currency);
    setCreatedAt(createdAt);
    setCurrencyControl(currency);
    this.setInitialValue(displayName, currency);
  }

  handleProfileUpdateSuccess (
    displayName: string,
    currency: string,
    isUser: boolean,
    walletId: string | null,
    setCurrency: (val: string) => void,
    setCurrencyControl: (val: string) => void
  ): void {
    if (isUser) {
      setCurrency(currency);
      if (walletId) {
        this.refreshWalletCurrency(walletId, curr => {
          setCurrency(curr);
          setCurrencyControl(curr);
        });
      }

      this.setInitialValue(displayName, currency);
    } else this.setInitialValue(displayName, currency);

    this.resetChanged();
  }
}
