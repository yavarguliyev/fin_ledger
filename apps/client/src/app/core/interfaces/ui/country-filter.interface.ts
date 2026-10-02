import { CountryOptionDto } from './country-option.interface';

export interface CountryFilterDto {
  options: CountryOptionDto[];
  query: string;
}
