import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of } from 'rxjs';

import { AppConfigService } from '../../src/app/core/services/app-config.service';
import { LedgerEntry } from '../../src/app/core/interfaces/ledger/ledger-entry.interface';
import { LedgerService } from '../../src/app/core/services/ledger.service';
import { LEDGER_PAGE_TEST as T } from '../constants/ledger-page.constant';

const entry = (id: string): LedgerEntry => ({ id, createdAt: T.CREATED_AT }) as LedgerEntry;
const get = jest.fn<Observable<LedgerEntry[]>, [string, { params: Record<string, string> }]>();

const create = (): LedgerService =>
  runInInjectionContext(
    Injector.create({ providers: [{ provide: HttpClient, useValue: { get } }, { provide: AppConfigService, useValue: { apiUrl: T.API } }] }),
    () => new LedgerService()
  );

describe('Ledger entries paged by cursor', () => {
  it('replaces the list on the first page and appends older pages after it', () => {
    const ledger = create();
    get.mockReturnValueOnce(of([entry(T.FIRST), entry(T.SECOND)]));
    ledger.getAccountEntries({ accountId: T.ACCOUNT, limit: T.LIMIT }).subscribe();
    expect(ledger.hasMore()).toBe(true);

    get.mockReturnValueOnce(of([entry(T.THIRD)]));
    ledger.getAccountEntries({ accountId: T.ACCOUNT, limit: T.LIMIT, before: T.CREATED_AT, beforeId: T.SECOND }).subscribe();

    expect(ledger.entries().map(item => item.id)).toEqual([T.FIRST, T.SECOND, T.THIRD]);
    expect(ledger.hasMore()).toBe(false);
    expect(get.mock.calls[1]?.[1].params).toMatchObject({ before: T.CREATED_AT, beforeId: T.SECOND });
  });
});
