import { Directive, input, output, signal } from '@angular/core';

import { FILE_DROP } from '../constants/file-drop.constant';
import { FileTransferHelper } from '../helpers/file-transfer.helper';

@Directive({
  selector: '[appFileDrop]',
  standalone: true,
  exportAs: 'fileDrop',
  host: { '(dragenter)': 'onEnter($event)', '(dragover)': 'onOver($event)', '(dragleave)': 'onLeave($event)', '(drop)': 'onDrop($event)' }
})
export class FileDropDirective {
  private depth = 0;

  readonly enabled = input(true, { alias: 'appFileDrop' });
  readonly dropped = output<File[]>();
  readonly dragging = signal(false);

  onEnter (event: DragEvent): void {
    if (!this.accepts(event)) return;
    event.preventDefault();
    this.depth += 1;
    this.dragging.set(true);
  }

  onOver (event: DragEvent): void {
    if (!this.accepts(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = FILE_DROP.DROP_EFFECT;
  }

  onLeave (event: DragEvent): void {
    if (!this.accepts(event)) return;
    this.depth = Math.max(0, this.depth - 1);
    if (this.depth === 0) this.dragging.set(false);
  }

  onDrop (event: DragEvent): void {
    if (!this.accepts(event)) return;
    event.preventDefault();
    this.depth = 0;
    this.dragging.set(false);
    const files = FileTransferHelper.files({ transfer: event.dataTransfer });
    if (files.length > 0) this.dropped.emit(files);
  }

  private accepts (event: DragEvent): boolean {
    return this.enabled() && FileTransferHelper.hasFiles({ transfer: event.dataTransfer });
  }
}
