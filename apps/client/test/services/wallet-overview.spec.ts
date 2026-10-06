import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of } from 'rxjs';

import { AppConfigService } from '../../src/app/core/services/app-config.service';
import { WalletService } from '../../src/app/core/services/wallet.service';
import { WalletOverview } from '../../src/app/core/interfaces/wallet/wallet-overview.interface';
import { Transaction } from '../../src/app/core/types/wallet/transaction.type';
import { WALLET_OVERVIEW_TEST as T } from '../constants/wallet-overview.constant';

const transaction = { id: T.TX_ID } as Transaction;
const overview = { summary: [], recent: { data: [transaction] } } as unknown as WalletOverview;
const get = jest.fn<Observable<WalletOverview>, [string]>();

const create = (): WalletService =>
  runInInjectionContext(
    Injector.create({ providers: [{ provide: HttpClient, useValue: { get } }, { provide: AppConfigService, useValue: { apiUrl: T.API } }] }),
    () => new WalletService()
  );

describe('Dashboard overview in one request', () => {
  it('loads summary and recent activity with a single call and keeps the activity list in sync', () => {
    get.mockReturnValue(of(overview));
    const wallets = create();

    wallets.getOverview({ walletId: T.WALLET_ID, page: T.PAGE, limit: T.LIMIT }).subscribe(result => expect(result).toEqual(overview));

    expect(get).toHaveBeenCalledTimes(T.ONE_CALL);
    expect(get.mock.calls[0]?.[0]).toBe(T.OVERVIEW_PATH);
    expect(wallets.transactions()).toEqual([transaction]);
  });
});
