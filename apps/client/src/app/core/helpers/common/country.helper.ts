import { COUNTRY_SELECT } from '../../constants/ui/country-select.constant';
import { CountryCodeDto } from '../../dtos/ui/country-code.dto';
import { CountryFilterDto } from '../../dtos/ui/country-filter.dto';
import { CountryOptionDto } from '../../dtos/ui/country-option.dto';

export class CountryHelper {
  static options (): CountryOptionDto[] {
    const names = new Intl.DisplayNames([COUNTRY_SELECT.LOCALE], { type: COUNTRY_SELECT.REGION_TYPE });

    return COUNTRY_SELECT.CODES.map(code => ({ code, name: names.of(code) ?? code, flag: CountryHelper.flag({ code }) })).sort((left, right) =>
      left.name.localeCompare(right.name, COUNTRY_SELECT.LOCALE)
    );
  }

  static flag ({ code }: CountryCodeDto): string {
    return String.fromCodePoint(...[...code.toUpperCase()].map(letter => (letter.codePointAt(0) ?? 0) + COUNTRY_SELECT.REGIONAL_INDICATOR_OFFSET));
  }

  static filter ({ options, query }: CountryFilterDto): CountryOptionDto[] {
    const needle = query.trim().toLocaleLowerCase(COUNTRY_SELECT.LOCALE);
    if (!needle) return options;

    return options.filter(option => option.code.toLocaleLowerCase(COUNTRY_SELECT.LOCALE) === needle || option.name.toLocaleLowerCase(COUNTRY_SELECT.LOCALE).includes(needle));
  }

  static find ({ options, query }: CountryFilterDto): CountryOptionDto | undefined {
    return options.find(option => option.code === query.toUpperCase());
  }
}
