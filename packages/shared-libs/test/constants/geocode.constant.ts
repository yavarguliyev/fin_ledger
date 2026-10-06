export const GEOCODE_SPEC = {
  FULL: {
    display_name: '12, Nizami Street, Baku, Absheron, AZ1000, Azerbaijan',
    lat: '40.3777',
    lon: '49.8920',
    address: { house_number: '12', road: 'Nizami Street', city: 'Baku', state: 'Absheron', postcode: 'AZ1000', country_code: 'az' }
  },
  FULL_RESULT: {
    label: '12, Nizami Street, Baku, Absheron, AZ1000, Azerbaijan',
    line1: '12 Nizami Street',
    city: 'Baku',
    region: 'Absheron',
    postalCode: 'AZ1000',
    countryCode: 'AZ',
    latitude: 40.3777,
    longitude: 49.892
  },
  VILLAGE: { display_name: 'Lahic, Ismayilli', lat: '40.85', lon: '48.39', address: { village: 'Lahic', county: 'Ismayilli' } },
  VILLAGE_CITY: 'Lahic',
  VILLAGE_REGION: 'Ismayilli',
  BARE: { display_name: 'Somewhere', lat: '1.5', lon: '2.5' }
} as const;
