import { AddressFormValue } from '../interfaces/address-form-value.interface';
import { AddressPayload } from '../../../../core/interfaces/address/address-payload.interface';
import { AddressPayloadInputDto } from '../interfaces/address-payload-input.interface';
import { GeocodedRefDto } from '../interfaces/geocoded-ref.interface';
import { SavedRefDto } from '../interfaces/saved-ref.interface';

export class AddressFormHelper {
  static fromGeocoded ({ address }: GeocodedRefDto): Partial<AddressFormValue> {
    return {
      ...(address.line1 && { line1: address.line1 }),
      ...(address.city && { city: address.city }),
      ...(address.region && { region: address.region }),
      ...(address.postalCode && { postalCode: address.postalCode }),
      ...(address.countryCode && { countryCode: address.countryCode })
    };
  }

  static fromSaved ({ address }: SavedRefDto): Partial<AddressFormValue> {
    return {
      line1: address.line1,
      city: address.city,
      countryCode: address.countryCode,
      ...(address.line2 && { line2: address.line2 }),
      ...(address.region && { region: address.region }),
      ...(address.postalCode && { postalCode: address.postalCode })
    };
  }

  static payload ({ value, source, pin }: AddressPayloadInputDto): AddressPayload {
    const line2 = value.line2.trim();
    const region = value.region.trim();
    const postalCode = value.postalCode.trim();

    return {
      line1: value.line1.trim(),
      city: value.city.trim(),
      countryCode: value.countryCode,
      source,
      ...(line2 && { line2 }),
      ...(region && { region }),
      ...(postalCode && { postalCode }),
      ...(pin && { latitude: pin.latitude, longitude: pin.longitude })
    };
  }
}
