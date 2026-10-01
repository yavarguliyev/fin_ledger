import { CALL_NOTICE_TEST } from '../../constants/call-notice.constant';
import { CallNoticeHelper } from '../../../src/app/core/helpers/support/call-notice.helper';

describe('CallNoticeHelper', () => {
  it('tells the caller why the call ended, like WhatsApp does', () => {
    expect(CallNoticeHelper.forReason({ reason: CALL_NOTICE_TEST.DECLINED })).toBe(CALL_NOTICE_TEST.DECLINED_NOTICE);
    expect(CallNoticeHelper.forReason({ reason: CALL_NOTICE_TEST.BUSY })).toBe(CALL_NOTICE_TEST.BUSY_NOTICE);
    expect(CallNoticeHelper.forReason({ reason: CALL_NOTICE_TEST.MISSED })).toBe(CALL_NOTICE_TEST.MISSED_NOTICE);
    expect(CallNoticeHelper.forReason({ reason: CALL_NOTICE_TEST.HANGUP })).toBe(CALL_NOTICE_TEST.ENDED_NOTICE);
  });

  it('asks for microphone access when the browser blocked it, and reports anything else as a failed call', () => {
    expect(CallNoticeHelper.forFailure({ error: new DOMException('', CALL_NOTICE_TEST.PERMISSION_ERROR) })).toBe(CALL_NOTICE_TEST.MIC_DENIED);
    expect(CallNoticeHelper.forFailure({ error: new Error() })).toBe(CALL_NOTICE_TEST.FAILED_NOTICE);
  });

  it('shows the call length as minutes and seconds', () => {
    expect(CallNoticeHelper.elapsed({ since: Date.now() - CALL_NOTICE_TEST.ELAPSED_MS })).toBe(CALL_NOTICE_TEST.ELAPSED_LABEL);
  });
});
