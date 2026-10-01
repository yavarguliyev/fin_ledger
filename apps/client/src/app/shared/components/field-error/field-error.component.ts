import { Component, computed, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { FormErrorHelper } from '../../../core/helpers/forms/form-error.helper';

@Component({
  selector: 'app-field-error',
  standalone: true,
  templateUrl: './templates/field-error.component.html'
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl | null>();
  readonly message = computed(() => FormErrorHelper.messageOf({ control: this.control() }));
}
