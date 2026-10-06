export const ADDRESS_MESSAGES = {
  DENIED: 'Location is turned off for this site. Allow it in your browser settings, or type your address below.',
  UNAVAILABLE: 'We could not find your location. Move the pin on the map or type your address below.',
  TIMEOUT: 'Finding your location took too long. Try again, or type your address below.',
  UNSUPPORTED: 'This browser cannot share your location. Type your address below.',
  LOOKUP_FAILED: 'Address lookup is busy right now. Type your address or try again in a moment.',
  SAVED: 'Address saved',
  REMOVED: 'Address removed',
  SAVE_FAILED: 'Could not save your address. Check the fields and try again.'
} as const;
