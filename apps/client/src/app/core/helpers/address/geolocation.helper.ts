import { ADDRESS } from '../../constants/address/address.constant';
import { ADDRESS_MESSAGES } from '../../constants/address/address-messages.constant';
import { GeolocationErrorDto } from '../../interfaces/address/geolocation-error.interface';
import { GeocodedAddress } from '../../interfaces/address/geocoded-address.interface';
import { LatLngDto } from '../../interfaces/address/lat-lng.interface';

export class GeolocationHelper {
  static messageFor ({ code }: GeolocationErrorDto): string {
    if (code === ADDRESS.PERMISSION_DENIED) return ADDRESS_MESSAGES.DENIED;
    if (code === ADDRESS.TIMEOUT) return ADDRESS_MESSAGES.TIMEOUT;
    if (code === ADDRESS.POSITION_UNAVAILABLE) return ADDRESS_MESSAGES.UNAVAILABLE;
    return ADDRESS_MESSAGES.UNSUPPORTED;
  }

  static blankAt ({ latitude, longitude }: LatLngDto): GeocodedAddress {
    return { latitude, longitude, label: ADDRESS.BLANK_LABEL, line1: null, city: null, region: null, postalCode: null, countryCode: null };
  }

  static current (): Promise<LatLngDto> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return reject(new Error(GeolocationHelper.messageFor({ code: null })));

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
        error => reject(new Error(GeolocationHelper.messageFor({ code: error.code }))),
        { enableHighAccuracy: true, timeout: ADDRESS.GEO_TIMEOUT_MS, maximumAge: ADDRESS.GEO_MAX_AGE_MS }
      );
    });
  }
}
