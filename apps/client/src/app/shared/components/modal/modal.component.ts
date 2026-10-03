import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalHelper } from '../../../core/helpers/ui/modal.helper';
import { FocusTrapDirective } from '../../directives/focus-trap.directive';
import { MODAL } from '../../../core/constants/ui/modal.constant';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FocusTrapDirective],
  templateUrl: './modal.component.html',
  host: { '(document:keydown.escape)': 'onEscape()' }
})
export class ModalComponent {
  private static opened = 0;

  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('');
  readonly maxWidth = input<string>('max-w-2xl');
  readonly showCloseButton = input<boolean>(true);
  readonly close = output<void>();
  readonly labels = MODAL;
  readonly titleId = `${MODAL.TITLE_ID_PREFIX}${++ModalComponent.opened}`;

  onClose (): void {
    this.close.emit();
  }

  onEscape (): void {
    if (ModalHelper.closesOnEscape({ isOpen: this.isOpen(), closable: this.showCloseButton() })) this.onClose();
  }

  onBackdropClick (event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose();
  }
}
