export interface ProfileUser {
  countryCode: string | null;
  dateOfBirth: string | null;
  createdAt: string;
}

export interface ProfileUserBody {
  user: ProfileUser;
}

export interface ProfileUpdateDto {
  body: Record<string, unknown>;
}

export interface KycStatusDto {
  status: string;
}

export interface ProfileFieldsRow {
  country_code: string;
  date_of_birth: string;
}
