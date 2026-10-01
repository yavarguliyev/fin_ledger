import { ProfileFieldsHelper } from '../../../src/app/features/profile/helpers/profile-fields.helper';
import { ProfileFields } from '../../../src/app/core/types/auth/profile-fields.type';

const SAVED: ProfileFields = { displayName: 'Ada Lovelace', countryCode: 'GB', dateOfBirth: '1990-04-17' };

describe('ProfileFieldsHelper.hasChanged', () => {
  it('sees no change when nothing was touched', () => {
    expect(ProfileFieldsHelper.hasChanged({ initial: SAVED, current: { ...SAVED } })).toBe(false);
  });

  it('sees a change in any editable field, not just the display name', () => {
    expect(ProfileFieldsHelper.hasChanged({ initial: SAVED, current: { ...SAVED, displayName: 'Ada L' } })).toBe(true);
    expect(ProfileFieldsHelper.hasChanged({ initial: SAVED, current: { ...SAVED, countryCode: 'FR' } })).toBe(true);
    expect(ProfileFieldsHelper.hasChanged({ initial: SAVED, current: { ...SAVED, dateOfBirth: '1991-04-17' } })).toBe(true);
  });

  it('ignores casing on the country code, since it is upper-cased on save', () => {
    expect(ProfileFieldsHelper.hasChanged({ initial: SAVED, current: { ...SAVED, countryCode: 'gb' } })).toBe(false);
  });

  it('ignores surrounding whitespace rather than reporting a change for it', () => {
    expect(ProfileFieldsHelper.hasChanged({ initial: SAVED, current: { ...SAVED, displayName: '  Ada Lovelace  ' } })).toBe(false);
  });

  it('treats a missing field and an empty one as the same, so a null from the API is not a change', () => {
    const blank: ProfileFields = { displayName: 'Ada Lovelace' };

    expect(ProfileFieldsHelper.hasChanged({ initial: blank, current: { displayName: 'Ada Lovelace', countryCode: '', dateOfBirth: '' } })).toBe(
      false
    );
  });
});
