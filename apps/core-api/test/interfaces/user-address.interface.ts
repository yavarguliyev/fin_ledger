export interface SavedAddress {
  line1: string;
  city: string;
  countryCode: string;
  latitude: number | null;
  source: string;
}

export interface AddressCount {
  count: number;
}
