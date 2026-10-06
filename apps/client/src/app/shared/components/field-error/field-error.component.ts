import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { FIELD_ERROR } from '../../../core/constants/ui/field-error.constant';
import { FormErrorHelper } from '../../../core/helpers/forms/form-error.helper';

@Component({
  selector: 'app-field-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './templates/field-error.component.html'
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl | null>();
  readonly fieldId = input<string>();
  readonly errorId = computed(() => {
    const fieldId = this.fieldId();
    return fieldId ? `${fieldId}${FIELD_ERROR.ID_SUFFIX}` : null;
  });
  readonly message = computed(() => FormErrorHelper.messageOf({ control: this.control() }));
}
