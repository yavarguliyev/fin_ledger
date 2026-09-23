import { NotificationMergeHelper } from './notification-merge.helper';
import { SSE_RECONNECT } from '../../constants/notification/sse.constant';
import { AppNotification } from '../../interfaces/notification/app-notification.interface';

const build = (id: string, createdAt: string): AppNotification => ({
  id,
  userId: 'user-1',
  title: id,
  content: id,
  status: 'PENDING',
  type: 'wallet',
  createdAt,
  updatedAt: createdAt
});

describe('NotificationMergeHelper', () => {
  it('keeps one copy of a notification that arrives twice', () => {
    const live = build('a', '2026-09-23T10:00:00.000Z');
    const merged = NotificationMergeHelper.merge({ current: [live], incoming: [live] });

    expect(merged).toHaveLength(1);
  });

  it('adds notifications missed during a gap without dropping the ones already shown', () => {
    const shown = [build('a', '2026-09-23T10:00:00.000Z')];
    const afterCatchUp = [build('c', '2026-09-23T10:02:00.000Z'), build('b', '2026-09-23T10:01:00.000Z'), build('a', '2026-09-23T10:00:00.000Z')];

    const merged = NotificationMergeHelper.merge({ current: shown, incoming: afterCatchUp });

    expect(merged.map(notification => notification.id)).toEqual(['c', 'b', 'a']);
  });

  it('prefers the freshly fetched copy when a notification changed while disconnected', () => {
    const stale = { ...build('a', '2026-09-23T10:00:00.000Z'), status: 'PENDING' };
    const fresh = { ...build('a', '2026-09-23T10:00:00.000Z'), status: 'READ' };

    const merged = NotificationMergeHelper.merge({ current: [stale], incoming: [fresh] });

    expect(merged[0]?.status).toBe('READ');
  });

  it('backs off further on each attempt and never past the ceiling', () => {
    const first = NotificationMergeHelper.backoffMs({ attempt: 1 });
    const third = NotificationMergeHelper.backoffMs({ attempt: 3 });

    expect(first).toBeLessThan(SSE_RECONNECT.BASE_DELAY_MS * 2);
    expect(third).toBeGreaterThan(first);

    for (let attempt = 1; attempt <= 20; attempt += 1) {
      const delay = NotificationMergeHelper.backoffMs({ attempt });
      expect(delay).toBeGreaterThan(0);
      expect(delay).toBeLessThanOrEqual(SSE_RECONNECT.MAX_DELAY_MS * (1 + SSE_RECONNECT.JITTER_RATIO));
    }
  });
});
