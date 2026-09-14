export const DIGIT_ONLY_PATTERN = /[\s-]/g;
export const CARD_LENGTH_PATTERN = /^\d{13,19}$/;
export const VISA_PATTERN = /^4/;
export const MC_PATTERN = /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/;
export const AMEX_PATTERN = /^3[47]/;
export const DISCOVER_PATTERN = /^(6011|65|64[4-9]|622)/;
export const GROUP_PATTERN = /.{1,4}/g;

export const sanitize = (raw: string): string => raw.replace(DIGIT_ONLY_PATTERN, '');
