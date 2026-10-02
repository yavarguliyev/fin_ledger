import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalHelper } from '../../../core/helpers/ui/modal.helper';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  host: { '(document:keydown.escape)': 'onEscape()' }
})
export class ModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('');
  readonly maxWidth = input<string>('max-w-2xl');
  readonly showCloseButton = input<boolean>(true);
  readonly close = output<void>();

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
