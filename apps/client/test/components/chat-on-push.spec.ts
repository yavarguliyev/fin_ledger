import { ChangeDetectionStrategy, Component, Type } from '@angular/core';

import { ChatSearchComponent } from '../../src/app/features/support/components/chat-search.component';
import { ContactListComponent } from '../../src/app/features/support/components/contact-list.component';
import { ConversationListComponent } from '../../src/app/features/support/components/conversation-list.component';
import { DeleteDialogComponent } from '../../src/app/features/support/components/delete-dialog.component';
import { EmojiPanelComponent } from '../../src/app/features/support/components/emoji-panel.component';
import { MessageComposerComponent } from '../../src/app/features/support/components/message-composer.component';
import { MessageThreadComponent } from '../../src/app/features/support/components/message-thread.component';
import { PresencePanelComponent } from '../../src/app/features/support/components/presence-panel.component';
import { RecorderBarComponent } from '../../src/app/features/support/components/recorder-bar.component';
import { SupportAvatarComponent } from '../../src/app/features/support/components/support-avatar.component';
import { SupportComponent } from '../../src/app/features/support/support.component';
import { VideoNoteComponent } from '../../src/app/features/support/components/video-note.component';
import { VoiceNoteComponent } from '../../src/app/features/support/components/voice-note.component';

const CHAT_COMPONENTS: Type<unknown>[] = [
  SupportComponent,
  ChatSearchComponent,
  ContactListComponent,
  ConversationListComponent,
  DeleteDialogComponent,
  EmojiPanelComponent,
  MessageComposerComponent,
  MessageThreadComponent,
  PresencePanelComponent,
  RecorderBarComponent,
  SupportAvatarComponent,
  VideoNoteComponent,
  VoiceNoteComponent
];

describe('Chat components render only when their inputs or signals change', () => {
  it.each(CHAT_COMPONENTS.map(component => [component.name, component]))('%s uses OnPush change detection', (_, component) => {
    const [metadata] = (component as unknown as { __annotations__: Component[] }).__annotations__;

    expect(metadata?.changeDetection).toBe(ChangeDetectionStrategy.OnPush);
  });
});
