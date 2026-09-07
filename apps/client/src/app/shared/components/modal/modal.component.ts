import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html'
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

  onBackdropClick (event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose();
  }
}
