import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { THREAD_BUBBLE } from '../constants/thread-bubble.constant';
import { VideoNoteComponent } from './video-note.component';
import { VoiceNoteComponent } from './voice-note.component';
import { SupportMessage } from '../../../core/types/support/support-message.type';

import { SUPPORT_MESSAGES } from '../../../core/constants/support/support-messages.constant';
import { SUPPORT_VIEW } from '../constants/support-view.constant';
import { MessageGroupDto } from '../../../core/dtos/support/message-group.dto';
import { SupportChatHelper } from '../../../core/helpers/support/support-chat.helper';
import { SUPPORT_ATTACHMENT } from '../../../core/constants/support/support-attachment.constant';
import { SupportAttachmentHelper } from '../../../core/helpers/support/support-attachment.helper';
import { MessageRulesHelper } from '../../../core/helpers/support/message-rules.helper';
import { SUPPORT_MESSAGE_RULES } from '../../../core/constants/support/support-message-rules.constant';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [DatePipe, VideoNoteComponent, VoiceNoteComponent],
  templateUrl: '../templates/message-thread.component.html'
})
export class MessageThreadComponent {
  readonly messages = input<SupportMessage[]>([]);
  readonly userId = input<string | null>(null);
  readonly peerOnline = input(false);
  readonly editRequested = output<SupportMessage>();
  readonly deleteRequested = output<SupportMessage>();
  readonly rules = SUPPORT_MESSAGE_RULES;
  readonly attachment = SUPPORT_ATTACHMENT;
  readonly labels = SUPPORT_MESSAGES;
  readonly view = SUPPORT_VIEW;

  get groups (): MessageGroupDto[] {
    return SupportChatHelper.groupByDay({ messages: this.messages() });
  }

  isOwn (message: SupportMessage): boolean {
    return !!this.userId() && message.senderUserId === this.userId();
  }

  isSystem (message: SupportMessage): boolean {
    return message.kind === SUPPORT_MESSAGE_RULES.SYSTEM_KIND;
  }

  canEdit (message: SupportMessage): boolean {
    return MessageRulesHelper.canEdit({ message, userId: this.userId() });
  }

  bubbleClass (message: SupportMessage): string {
    if (this.isVideoNote(message)) return THREAD_BUBBLE.VIDEO_NOTE;
    return this.isOwn(message) ? THREAD_BUBBLE.OWN : THREAD_BUBBLE.OTHER;
  }

  isVideoNote (message: SupportMessage): boolean {
    return !message.deletedAt && message.kind === SUPPORT_ATTACHMENT.VIDEO_KIND && !!message.attachment?.durationSeconds;
  }

  kindOf (message: SupportMessage): string {
    return message.kind;
  }

  isImage (message: SupportMessage): boolean {
    return message.kind === SUPPORT_ATTACHMENT.IMAGE_KIND;
  }

  size (message: SupportMessage): string {
    return SupportAttachmentHelper.formatSize({ bytes: message.attachment?.sizeBytes ?? 0 });
  }

  delivered (message: SupportMessage): boolean {
    return !!message.seen || this.peerOnline();
  }

  tickLabel (message: SupportMessage): string {
    if (message.seen) return this.view.SEEN_LABEL;
    return this.delivered(message) ? this.view.DELIVERED_LABEL : this.view.SENT_LABEL;
  }
}
