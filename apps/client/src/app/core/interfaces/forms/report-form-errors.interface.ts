import { ApplyFormErrorsDto } from './apply-form-errors.interface';

export interface ReportFormErrorsDto extends ApplyFormErrorsDto {
  fallback: string;
}
