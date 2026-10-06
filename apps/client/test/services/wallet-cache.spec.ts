import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of } from 'rxjs';

import { AppConfigService } from '../../src/app/core/services/app-config.service';
import { WalletService } from '../../src/app/core/services/wallet.service';
import { Wallet } from '../../src/app/core/types/wallet/wallet.type';
import { WALLET_CACHE_TEST as T } from '../constants/wallet-cache.constant';

const wallet = { id: T.WALLET_ID, currency: T.CURRENCY } as Wallet;
const get = jest.fn<Observable<Wallet[]>, [string]>();

const create = (): WalletService =>
  runInInjectionContext(
    Injector.create({ providers: [{ provide: HttpClient, useValue: { get } }, { provide: AppConfigService, useValue: { apiUrl: T.API } }] }),
    () => new WalletService()
  );

describe('Wallet list loaded once per page visit window', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockReturnValue(of([wallet]));
    jest.spyOn(Date, 'now').mockReturnValue(T.NOW);
  });

  afterEach(() => jest.restoreAllMocks());

  it('reuses the stored list on the next page instead of fetching it again', () => {
    const wallets = create();
    wallets.ensureWallets().subscribe();
    jest.spyOn(Date, 'now').mockReturnValue(T.NOW + T.WITHIN_WINDOW_MS);
    wallets.ensureWallets().subscribe(list => expect(list).toEqual([wallet]));

    expect(get).toHaveBeenCalledTimes(T.ONE_CALL);
  });

  it('fetches again once the stored list is stale, and after sign-out', () => {
    const wallets = create();
    wallets.ensureWallets().subscribe();
    jest.spyOn(Date, 'now').mockReturnValue(T.NOW + T.PAST_WINDOW_MS);
    wallets.ensureWallets().subscribe();
    expect(get).toHaveBeenCalledTimes(T.TWO_CALLS);

    wallets.reset();
    wallets.ensureWallets().subscribe();
    expect(get).toHaveBeenCalledTimes(T.TWO_CALLS + T.ONE_CALL);
  });
});
