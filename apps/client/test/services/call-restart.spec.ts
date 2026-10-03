import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of } from 'rxjs';

import { CallRestartService } from '../../src/app/core/services/call-restart.service';
import { CallSessionService } from '../../src/app/core/services/call-session.service';
import { RenegotiateCallDto } from '../../src/app/core/interfaces/support/renegotiate-call.interface';
import { SupportCallApiService } from '../../src/app/core/services/support-call-api.service';
import { CALL_RESTART_TEST as T } from '../constants/call-restart.constant';

const renegotiate = jest.fn<Observable<unknown>, [RenegotiateCallDto]>(() => of({}));
const createOffer = jest.fn(() => Promise.resolve({ type: 'offer', sdp: T.OFFER_SDP }));
const peer = {
  createOffer,
  createAnswer: (): Promise<RTCSessionDescriptionInit> => Promise.resolve({ type: 'answer', sdp: T.ANSWER_SDP }),
  setLocalDescription: (): Promise<void> => Promise.resolve(),
  setRemoteDescription: (): Promise<void> => Promise.resolve()
};

const create = (): CallRestartService => {
  const injector = Injector.create({
    providers: [
      { provide: SupportCallApiService, useValue: { renegotiate } },
      { provide: CallSessionService, useValue: { connection: (): typeof peer => peer } }
    ]
  });
  return runInInjectionContext(injector, () => new CallRestartService());
};

const settle = async (): Promise<void> => {
  for (let tick = 0; tick < T.EXTRA_DROPS; tick++) await Promise.resolve();
};

describe('Restarting a dropped call', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    [renegotiate, createOffer].forEach(mock => mock.mockClear());
  });

  afterEach(() => jest.useRealTimers());

  it('lets the caller send an ICE restart offer, at most twice', async () => {
    const restart = create();
    restart.begin({ caller: true });
    for (let drop = 0; drop < T.EXTRA_DROPS; drop++) restart.recover({ callId: T.CALL_ID, onFailed: jest.fn() });
    await settle();

    expect(createOffer).toHaveBeenCalledWith({ iceRestart: true });
    expect(renegotiate).toHaveBeenCalledTimes(T.MAX_OFFERS);
  });

  it('ends the call only if the connection is still broken after the grace period', () => {
    const onFailed = jest.fn();
    const restart = create();
    restart.begin({ caller: false });
    restart.recover({ callId: T.CALL_ID, onFailed });

    jest.advanceTimersByTime(T.GRACE_MS);
    expect(onFailed).toHaveBeenCalledTimes(1);
    expect(renegotiate).not.toHaveBeenCalled();
  });

  it('keeps the call when the connection comes back in time', () => {
    const onFailed = jest.fn();
    const restart = create();
    restart.begin({ caller: false });
    restart.recover({ callId: T.CALL_ID, onFailed });
    restart.reset();

    jest.advanceTimersByTime(T.GRACE_MS);
    expect(onFailed).not.toHaveBeenCalled();
  });

  it('answers a restart offer from the other side', async () => {
    await create().handle({ callId: T.CALL_ID, sdp: T.OFFER_SDP, sdpType: 'offer' });

    expect(renegotiate).toHaveBeenCalledWith({ callId: T.CALL_ID, sdp: T.ANSWER_SDP, sdpType: 'answer' });
  });
});
