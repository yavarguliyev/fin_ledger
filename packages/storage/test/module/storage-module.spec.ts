import { ClientIds } from '@common/shared-libs';

import { StorageModule } from '../../src/modules/storage.module';

describe('StorageModule.forRoot', () => {
  it('returns the same module for the same client so Nest opens one Redis connection', () => {
    expect(StorageModule.forRoot({ clientId: ClientIds.API_GATEWAY })).toBe(StorageModule.forRoot({ clientId: ClientIds.API_GATEWAY }));
  });

  it('treats a missing client id as the default client', () => {
    expect(StorageModule.forRoot()).toBe(StorageModule.forRoot({ clientId: ClientIds.DEFAULT }));
  });

  it('keeps a separate module per client id', () => {
    expect(StorageModule.forRoot({ clientId: ClientIds.API_GATEWAY })).not.toBe(StorageModule.forRoot({ clientId: ClientIds.DEFAULT }));
  });
});
