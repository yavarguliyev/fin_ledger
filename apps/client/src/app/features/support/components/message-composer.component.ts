import { Component, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';

import { RecordedClipDto } from '../../../core/dtos/support/recorded-clip.dto';
import { RecorderBarComponent } from './recorder-bar.component';
import { RecordingKind } from '../../../core/types/support/recording-kind.type';
import { SUPPORT_RECORDING } from '../../../core/constants/support/support-recording.constant';
import { ToastService } from '../../../core/services/toast.service';

import { ComposeSubmitDto } from '../../../core/dtos/support/compose-submit.dto';
import { EditSaveDto } from '../../../core/dtos/support/edit-save.dto';
import { SUPPORT } from '../../../core/constants/support/support.constant';
import { SUPPORT_ATTACHMENT } from '../../../core/constants/support/support-attachment.constant';
import { SUPPORT_MESSAGES } from '../../../core/constants/support/support-messages.constant';
import { SUPPORT_VIEW } from '../constants/support-view.constant';
import { SupportAttachmentHelper } from '../../../core/helpers/support/support-attachment.helper';
import { SupportMessage } from '../../../core/types/support/support-message.type';

@Component({
  selector: 'app-message-composer',
  standalone: true,
  imports: [RecorderBarComponent],
  templateUrl: '../templates/message-composer.component.html'
})
export class MessageComposerComponent {
  private readonly field = viewChild<ElementRef<HTMLTextAreaElement>>('field');
  private readonly picker = viewChild<ElementRef<HTMLInputElement>>('picker');

  readonly sending = input(false);
  readonly disabled = input(false);
  readonly editing = input<SupportMessage | null>(null);
  readonly submitted = output<ComposeSubmitDto>();
  readonly saved = output<EditSaveDto>();
  readonly cancelled = output();
  readonly recorded = output<RecordedClipDto>();
  readonly recording = signal<RecordingKind | null>(null);
  readonly recordingLabels = SUPPORT_RECORDING;
  private readonly toast = inject(ToastService);

  readonly draft = signal('');
  readonly files = signal<File[]>([]);
  readonly labels = SUPPORT_MESSAGES;
  readonly attachment = SUPPORT_ATTACHMENT;
  readonly maxLength = SUPPORT.BODY_MAX_LENGTH;

  constructor () {
    effect(() => {
      const message = this.editing();
      this.draft.set(message?.body ?? '');
      this.files.set([]);
      queueMicrotask(() => this.resize());
    });
  }

  get canSend (): boolean {
    const hasContent = this.draft().trim().length > 0 || this.files().length > 0 || !!this.editing()?.attachment;
    return hasContent && !this.sending() && !this.disabled();
  }

  get showMic (): boolean {
    return !this.editing() && !this.sending() && this.draft().trim().length === 0 && this.files().length === 0;
  }

  record (kind: RecordingKind): void {
    this.recording.set(kind);
  }

  onRecorded (clip: RecordedClipDto): void {
    this.recording.set(null);
    this.recorded.emit(clip);
  }

  onRecordFailed (message: string): void {
    this.recording.set(null);
    this.toast.error(message);
  }

  size (file: File): string {
    return SupportAttachmentHelper.formatSize({ bytes: file.size });
  }

  onInput (value: string): void {
    this.draft.set(value);
    this.resize();
  }

  onKeydown (event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.editing()) this.cancelled.emit();
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    this.submit();
  }

  pick (): void {
    this.picker()?.nativeElement.click();
  }

  onPicked (list: FileList | null): void {
    const picked = Array.from(list ?? []);
    this.files.set(this.editing() ? picked.slice(0, 1) : [...this.files(), ...picked]);
    const element = this.picker()?.nativeElement;
    if (element) element.value = '';
  }

  remove (index: number): void {
    this.files.set(this.files().filter((_, position) => position !== index));
  }

  submit (): void {
    if (!this.canSend) return;

    const body = this.draft().trim();
    if (this.editing()) this.saved.emit({ body, file: this.files()[0] ?? null });
    else this.submitted.emit({ body, files: this.files() });

    this.draft.set('');
    this.files.set([]);
    this.resize();
  }

  private resize (): void {
    const element = this.field()?.nativeElement;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, SUPPORT_VIEW.MAX_COMPOSER_HEIGHT)}px`;
  }
}
