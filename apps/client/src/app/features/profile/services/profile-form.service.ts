import { Injectable, signal, inject } from '@angular/core';

import { WalletService } from '../../../core/services/wallet.service';
import { ShowMoreConfig } from '../../../core/interfaces/ui/show-more-config.interface';
import { VisibleImages } from '../../../core/interfaces/auth/visible-images.interface';

@Injectable()
export class ProfileFormService {
  private readonly walletService = inject(WalletService);
  private readonly initialDisplayName = signal<string | null>(null);
  readonly isFormChanged = signal(false);
  readonly imagesPage = signal(1);
  readonly imagesPageSize = signal(2);

  setInitialValue (displayName: string): void {
    this.initialDisplayName.set(displayName);
    this.isFormChanged.set(false);
  }

  checkIfChanged (currentDisplayName: string | null | undefined): void {
    const initial = this.initialDisplayName();
    if (initial === null) return;

    this.isFormChanged.set(currentDisplayName !== initial);
  }

  loadMemberSince (onLoaded: (createdAt: string) => void): void {
    this.walletService.loadWallets().subscribe({
      next: ([firstWallet]) => {
        if (firstWallet) onLoaded(firstWallet.createdAt);
      }
    });
  }

  loadMoreImages (): void {
    this.imagesPage.update(page => page + 1);
  }

  resetImagesPage (): void {
    this.imagesPage.set(1);
  }

  getVisibleImages (allImages: Array<VisibleImages>): Array<VisibleImages> {
    return allImages.slice(0, this.imagesPage() * this.imagesPageSize());
  }

  getShowMoreConfig (totalItems: number): ShowMoreConfig {
    return { pageSize: this.imagesPageSize(), currentPage: this.imagesPage(), totalItems };
  }
}
