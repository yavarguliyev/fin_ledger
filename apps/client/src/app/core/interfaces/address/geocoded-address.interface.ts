export interface GeocodedAddress {
  label: string;
  line1: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  latitude: number;
  longitude: number;
}
