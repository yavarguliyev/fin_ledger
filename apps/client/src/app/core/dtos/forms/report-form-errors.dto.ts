import { ApplyFormErrorsDto } from './apply-form-errors.dto';

export interface ReportFormErrorsDto extends ApplyFormErrorsDto {
  fallback: string;
}
