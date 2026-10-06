import { LatLngDto } from './lat-lng.interface';

export interface PositionLookupDto {
  position: LatLngDto;
  source: string;
}
