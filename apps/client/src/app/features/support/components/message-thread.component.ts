import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';

import { THREAD_BUBBLE } from '../constants/thread-bubble.constant';
import { VideoNoteComponent } from './video-note.component';
import { VoiceNoteComponent } from './voice-note.component';
import { SupportMessage } from '../../../core/types/support/support-message.type';

import { SUPPORT_MESSAGES } from '../../../core/constants/support/support-messages.constant';
import { SUPPORT_VIEW } from '../constants/support-view.constant';
import { MessageGroupDto } from '../../../core/interfaces/support/message-group.interface';
import { SupportChatHelper } from '../../../core/helpers/support/support-chat.helper';
import { SUPPORT_ATTACHMENT } from '../../../core/constants/support/support-attachment.constant';
import { SupportAttachmentHelper } from '../../../core/helpers/support/support-attachment.helper';
import { MessageRulesHelper } from '../../../core/helpers/support/message-rules.helper';
import { SUPPORT_MESSAGE_RULES } from '../../../core/constants/support/support-message-rules.constant';
import { MESSAGE_REACTION } from '../../../core/constants/support/message-reaction.constant';
import { EMOJI_CATALOG } from '../constants/emoji-catalog.constant';
import { EmojiPanelComponent } from './emoji-panel.component';
import { ReactionHelper } from '../../../core/helpers/support/reaction.helper';
import { ReactionSummary } from '../../../core/interfaces/support/reaction-summary.interface';
import { ReactionToggleDto } from '../../../core/interfaces/support/reaction-toggle.interface';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, VideoNoteComponent, VoiceNoteComponent, EmojiPanelComponent, NgOptimizedImage],
  templateUrl: '../templates/message-thread.component.html'
})
export class MessageThreadComponent {
  readonly messages = input<SupportMessage[]>([]);
  readonly userId = input<string | null>(null);
  readonly peerOnline = input(false);
  readonly markerId = input<string | null>(null);
  readonly editRequested = output<SupportMessage>();
  readonly deleteRequested = output<SupportMessage>();
  readonly replyRequested = output<SupportMessage>();
  readonly quoteRequested = output<string>();
  readonly reacted = output<ReactionToggleDto>();
  readonly pickerFor = signal<string | null>(null);
  readonly expandedFor = signal<string | null>(null);
  readonly moreLabel = EMOJI_CATALOG.MORE_LABEL;
  readonly emojis = MESSAGE_REACTION.ALLOWED;
  readonly reactionLabels = MESSAGE_REACTION;
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

  reactionsOf (message: SupportMessage): ReactionSummary[] {
    return ReactionHelper.summarize({ reactions: message.reactions ?? [], myUserId: this.userId() });
  }

  pick ({ messageId, emoji }: ReactionToggleDto): void {
    this.pickerFor.set(null);
    this.expandedFor.set(null);
    this.reacted.emit({ messageId, emoji });
  }

  quoteAuthor (message: SupportMessage): string {
    const reply = message.replyTo;
    if (!reply) return '';
    return reply.senderUserId === this.userId() ? this.view.YOU_LABEL : (reply.senderName ?? this.view.FALLBACK_NAME);
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
