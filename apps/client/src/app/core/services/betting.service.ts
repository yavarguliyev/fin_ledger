import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { BetService } from './bet.service';
import { WalletService } from './wallet.service';
import { GameEventsService } from './game-events.service';
import { BetRequest } from '../interfaces/betting/bet-request.interface';
import { Bet } from '../interfaces/betting/bet.interface';
import { GameEvent } from '../interfaces/betting/game-event.interface';
import { Wallet } from '../interfaces/wallet/wallet.interface';
import { PaginatedResponse } from '../interfaces/http/paginated-response.interface';
import { UuidHelper } from '../helpers/common/uuid.helper';

@Injectable({ providedIn: 'root' })
export class BettingService {
  private readonly betService = inject(BetService);
  private readonly walletService = inject(WalletService);
  private readonly gameEventsService = inject(GameEventsService);

  private readonly betsSignal = signal<Bet[]>([]);
  private readonly totalBetsSignal = signal(0);

  readonly bets = computed(() => this.betsSignal());
  readonly totalBets = computed(() => this.totalBetsSignal());
  readonly availableBalance = computed(() => this.walletService.wallet()?.availableBalanceMinor ?? 0);
  readonly currency = computed(() => this.walletService.wallet()?.currency ?? 'USD');
  readonly events = computed(() => this.gameEventsService.events());

  loadEvents (): Observable<GameEvent[]> {
    return this.gameEventsService.getEvents();
  }

  loadWallets (): Observable<Wallet[]> {
    return this.walletService.loadWallets();
  }

  loadBets (page: number, pageSize: number): Observable<PaginatedResponse<Bet>> {
    return this.betService.getBets(page, pageSize).pipe(
      tap(response => {
        this.betsSignal.set(response.data);
        this.totalBetsSignal.set(response.total);
      })
    );
  }

  placeBet (event: GameEvent, stakeMinor: number): Observable<Bet> {
    const walletId = this.walletService.wallet()?.id;
    if (!walletId) throw new Error('Wallet not found');

    const request: BetRequest = { walletId, eventId: event.id, selection: event.label, stakeMinor, idempotencyKey: UuidHelper.generate() };
    return this.betService.placeBet(request).pipe(tap(() => this.walletService.getWallet(walletId).subscribe()));
  }
}
