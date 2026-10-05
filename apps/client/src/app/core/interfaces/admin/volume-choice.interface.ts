import { CurrencyVolume } from './currency-volume.interface';

export interface VolumeChoiceDto {
  volumes: CurrencyVolume[];
  currency: string | null;
}
