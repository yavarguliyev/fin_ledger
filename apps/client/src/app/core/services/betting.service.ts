import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { WalletService } from './wallet.service';
import { GameEventsService } from './game-events.service';
import { AuthService } from './auth.service';
import { GameEvent, Transaction, BetRequest, Wallet } from '../models/wallet.model';
import { PaginatedResponse } from '../models/base.mode';
import { uuid } from '../utils/uuid.util';

@Injectable({ providedIn: 'root' })
export class BettingService {
  private readonly walletService = inject(WalletService);
  private readonly gameEventsService = inject(GameEventsService);
  private readonly auth = inject(AuthService);

  private readonly betsSignal = signal<Transaction[]>([]);
  private readonly totalBetsSignal = signal(0);
  private readonly availableBalanceSignal = signal(0);

  readonly bets = computed(() => this.betsSignal());
  readonly totalBets = computed(() => this.totalBetsSignal());
  readonly availableBalance = computed(() => this.availableBalanceSignal());
  readonly currency = computed(() => this.walletService.wallet()?.currency ?? 'USD');
  readonly events = computed(() => this.gameEventsService.events());

  loadEvents (): Observable<GameEvent[]> {
    return this.gameEventsService.getEvents();
  }

  loadWalletBalance (walletId: string): Observable<Wallet> {
    return this.walletService
      .getWallet(walletId)
      .pipe(tap(() => this.availableBalanceSignal.set(this.walletService.wallet()?.availableBalanceMinor ?? 0)));
  }

  loadBets (walletId: string, page: number, pageSize: number): Observable<PaginatedResponse<Transaction>> {
    return this.walletService.getBets(walletId, page, pageSize).pipe(
      tap(response => {
        this.betsSignal.set(response.data);
        this.totalBetsSignal.set(response.total);
      })
    );
  }

  placeBet (event: GameEvent, stakeMinor: number): Observable<Wallet> {
    const user = this.auth.currentUser();
    const walletId = user?.walletId;
    const wallet = this.walletService.wallet();

    if (!walletId || !wallet) throw new Error('Wallet not found');

    const betRequest: BetRequest = { amountMinor: stakeMinor, currency: wallet.currency, transactionId: uuid(), reference: event.label };
    return this.walletService
      .placeBet(walletId, betRequest)
      .pipe(tap(() => this.availableBalanceSignal.set(this.walletService.wallet()?.availableBalanceMinor ?? 0)));
  }
}
