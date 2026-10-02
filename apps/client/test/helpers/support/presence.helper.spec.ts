import { PresenceEntry } from '../../../src/app/core/types/support/presence-entry.type';
import { PresenceHelper } from '../../../src/app/core/helpers/support/presence.helper';
import { PRESENCE_TEST } from '../../constants/presence.constant';

const staff: PresenceEntry = { ...PRESENCE_TEST.STAFF };
const other: PresenceEntry = { ...PRESENCE_TEST.OTHER };

describe('PresenceHelper', () => {
  it('treats only an ONLINE entry as online', () => {
    expect(PresenceHelper.isOnline({ presence: other })).toBe(true);
    expect(PresenceHelper.isOnline({ presence: staff })).toBe(false);
    expect(PresenceHelper.isOnline({ presence: null })).toBe(false);
  });

  it('flips a contact online the moment their presence event arrives', () => {
    const updated = PresenceHelper.replace({ current: [staff, other], presence: { ...staff, state: PRESENCE_TEST.ONLINE } });

    expect(updated.find(entry => entry.userId === staff.userId)?.state).toBe(PRESENCE_TEST.ONLINE);
    expect(updated).toHaveLength(2);
  });

  it('drops someone from the online list when they log out, keeping their last seen time on the contact', () => {
    const offline: PresenceEntry = { ...other, state: PRESENCE_TEST.OFFLINE, lastSeenAt: PRESENCE_TEST.LATER };

    expect(PresenceHelper.upsertOnline({ current: [other], presence: offline })).toEqual([]);
    expect(PresenceHelper.replace({ current: [other], presence: offline })[0]?.lastSeenAt).toBe(PRESENCE_TEST.LATER);
  });

  it('adds someone to the online list once, however many events arrive', () => {
    const once = PresenceHelper.upsertOnline({ current: [], presence: other });

    expect(PresenceHelper.upsertOnline({ current: once, presence: other })).toHaveLength(1);
  });

  it('keeps the contact name and role when a timeout event only carries the id and last seen time', () => {
    const expired: PresenceEntry = { ...other, displayName: PRESENCE_TEST.UNKNOWN, role: PRESENCE_TEST.UNKNOWN, state: PRESENCE_TEST.OFFLINE };

    expect(PresenceHelper.replace({ current: [other], presence: expired })[0]).toMatchObject({
      displayName: other.displayName,
      role: other.role,
      state: PRESENCE_TEST.OFFLINE
    });
  });

  it('shows the live list length below the cap and the server count once the list is capped', () => {
    expect(PresenceHelper.displayTotal({ listed: PRESENCE_TEST.FEW, counted: PRESENCE_TEST.STALE_COUNT })).toBe(PRESENCE_TEST.FEW);
    expect(PresenceHelper.displayTotal({ listed: PRESENCE_TEST.CAP, counted: PRESENCE_TEST.MANY })).toBe(PRESENCE_TEST.MANY);
  });
});
