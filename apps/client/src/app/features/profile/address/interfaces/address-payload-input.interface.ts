import { AddressFormValue } from './address-form-value.interface';
import { LatLngDto } from '../../../../core/interfaces/address/lat-lng.interface';

export interface AddressPayloadInputDto {
  value: AddressFormValue;
  source: string;
  pin: LatLngDto | null;
}
