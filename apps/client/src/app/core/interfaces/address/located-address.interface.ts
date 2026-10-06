import { GeocodedAddress } from './geocoded-address.interface';

export interface LocatedAddressDto {
  address: GeocodedAddress;
  source: string;
}
