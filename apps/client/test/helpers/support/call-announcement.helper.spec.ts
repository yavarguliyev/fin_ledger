import { CallAnnouncementHelper } from '../../../src/app/core/helpers/support/call-announcement.helper';
import { LIVE_REGIONS_TEST as T } from '../../constants/live-regions.constant';

describe('CallAnnouncementHelper', () => {
  it('names the caller when a call comes in', () => {
    expect(CallAnnouncementHelper.from({ phase: 'incoming', status: T.INCOMING_VOICE, peerName: T.PEER })).toBe(T.INCOMING_FROM_PEER);
    expect(CallAnnouncementHelper.from({ phase: 'incoming', status: T.INCOMING_VOICE, peerName: '' })).toBe(T.INCOMING_VOICE);
  });

  it('says the call connected once instead of reading out the timer', () => {
    expect(CallAnnouncementHelper.from({ phase: 'active', status: T.ELAPSED, peerName: T.PEER })).toBe(T.CONNECTED);
  });

  it('reads the status for the other phases and stays silent when idle', () => {
    expect(CallAnnouncementHelper.from({ phase: 'outgoing', status: T.CALLING, peerName: T.PEER })).toBe(T.CALLING);
    expect(CallAnnouncementHelper.from({ phase: 'idle', status: '', peerName: '' })).toBe('');
  });
});
