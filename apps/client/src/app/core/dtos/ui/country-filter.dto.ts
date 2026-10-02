import { CountryOptionDto } from './country-option.dto';

export interface CountryFilterDto {
  options: CountryOptionDto[];
  query: string;
}
