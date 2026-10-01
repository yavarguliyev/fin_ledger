import { DisplayName } from '../../interfaces/base/display-name.interface';

export type ProfileFields = DisplayName & {
  countryCode?: string;
  dateOfBirth?: string;
};
