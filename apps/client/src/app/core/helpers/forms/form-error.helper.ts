import { HttpRequestError } from '../../errors/http-request.error';
import { HTTP_ERRORS } from '../../constants/http/http-errors.constant';
import { ApplyFormErrorsDto } from '../../interfaces/forms/apply-form-errors.interface';
import { ControlRefDto } from '../../interfaces/forms/control-ref.interface';
import { ReportFormErrorsDto } from '../../interfaces/forms/report-form-errors.interface';

export class FormErrorHelper {
  static clear ({ form }: ApplyFormErrorsDto): void {
    Object.values(form.controls).forEach(control => FormErrorHelper.clearControl({ control }));
  }

  static messageOf ({ control }: ControlRefDto): string | null {
    const message: unknown = control?.errors?.[HTTP_ERRORS.SERVER_ERROR_KEY];
    return typeof message === 'string' ? message : null;
  }

  private static clearControl ({ control }: ControlRefDto): void {
    if (!control?.errors || !FormErrorHelper.messageOf({ control })) return;
    const rest = Object.fromEntries(Object.entries(control.errors).filter(([key]) => key !== HTTP_ERRORS.SERVER_ERROR_KEY));
    control.setErrors(Object.keys(rest).length > 0 ? rest : null);
  }

  static report ({ form, error, fallback, aliases }: ReportFormErrorsDto): string {
    const unplaced = FormErrorHelper.apply({ form, error, ...(aliases && { aliases }) });
    const placed = error instanceof HttpRequestError && Object.keys(error.fieldErrors).length > unplaced.length;
    if (unplaced.length > 0) return unplaced.join(HTTP_ERRORS.ISSUE_SEPARATOR);
    return placed ? '' : fallback;
  }

  static apply ({ form, error, aliases = {} }: ApplyFormErrorsDto): string[] {
    if (!(error instanceof HttpRequestError)) return [];

    const unplaced: string[] = [];

    for (const [field, message] of Object.entries(error.fieldErrors)) {
      const control = form.get(aliases[field] ?? field);

      if (!control) {
        unplaced.push(message);
        continue;
      }

      control.setErrors({ ...control.errors, [HTTP_ERRORS.SERVER_ERROR_KEY]: message });
      control.markAsTouched();
    }

    return unplaced;
  }
}
