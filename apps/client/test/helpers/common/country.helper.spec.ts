import { CountryHelper } from '../../../src/app/core/helpers/common/country.helper';
import { COUNTRY_SPEC as C } from '../../constants/country.constant';

describe('CountryHelper', () => {
  const options = CountryHelper.options();

  it('lists every ISO country with a name and flag, sorted by name', () => {
    expect(options).toHaveLength(C.TOTAL);
    expect(options[0]?.name).toBe(C.FIRST);
    expect(options).toContainEqual(C.GERMANY);
  });

  it('matches by exact code or by part of the name', () => {
    expect(CountryHelper.filter({ options, query: C.AZ }).map(option => option.code)).toContain(C.AZERBAIJAN);
    expect(CountryHelper.filter({ options, query: C.PARTIAL }).map(option => option.code)).toEqual([C.AZERBAIJAN]);
    expect(CountryHelper.filter({ options, query: C.NONSENSE })).toEqual([]);
  });

  it('returns everything for an empty query and finds the stored code', () => {
    expect(CountryHelper.filter({ options, query: '' })).toHaveLength(C.TOTAL);
    expect(CountryHelper.find({ options, query: C.GERMANY.code })).toEqual(C.GERMANY);
  });
});
