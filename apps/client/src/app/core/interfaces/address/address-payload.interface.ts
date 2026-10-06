export interface AddressPayload {
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  source: string;
}
