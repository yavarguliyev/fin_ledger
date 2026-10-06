import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';

import { BUTTON } from '../../../core/constants/ui/button.constant';
import { UiPrimitiveHelper } from '../../../core/helpers/ui/ui-primitive.helper';
import { ButtonType } from '../../../core/types/ui/button-type.type';
import { ButtonVariant } from '../../../core/types/ui/button-variant.type';

@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html'
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>(BUTTON.VARIANTS.PRIMARY);
  readonly type = input<ButtonType>(BUTTON.TYPES.BUTTON);
  readonly disabled = input<boolean>(false);
  readonly busy = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);
  readonly ariaLabel = input<string | null>(null);

  readonly pressed = output<MouseEvent>();

  readonly classes = computed(() => UiPrimitiveHelper.button({ variant: this.variant(), fullWidth: this.fullWidth() }));
}
