import { Injectable, inject, signal } from '@angular/core';

import { ContactCard } from '../interfaces/support/contact-card.interface';
import { CursorItem } from '../interfaces/support/cursor-item.interface';
import { PanelAppendDto } from '../interfaces/support/panel-append.interface';
import { PanelItem } from '../types/support/panel-item.type';
import { MessageLink } from '../interfaces/support/message-link.interface';
import { PanelPagingHelper } from '../helpers/support/panel-paging.helper';
import { PanelTabRefDto } from '../interfaces/support/panel-tab-ref.interface';
import { SUPPORT_PANEL } from '../constants/support/support-panel.constant';
import { SupportChatStore } from './support-chat.store';
import { SupportMessage } from '../types/support/support-message.type';
import { SupportPanelApiService } from './support-panel-api.service';
import { SupportStarStore } from './support-star.store';
import { SupportStorageStore } from './support-storage.store';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SupportPanelStore {
  private readonly api = inject(SupportPanelApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly stars = inject(SupportStarStore);
  private readonly storage = inject(SupportStorageStore);
  private readonly toast = inject(ToastService);

  private readonly openSignal = signal(false);
  private readonly storageViewSignal = signal(false);
  private readonly tabSignal = signal<string>(SUPPORT_PANEL.TABS.MEDIA);
  private readonly contactSignal = signal<ContactCard | null>(null);
  private readonly mediaSignal = signal<SupportMessage[]>([]);
  private readonly docsSignal = signal<SupportMessage[]>([]);
  private readonly linksSignal = signal<MessageLink[]>([]);
  private readonly hasMoreSignal = signal<Record<string, boolean>>({});
  private readonly loadingSignal = signal(false);

  readonly open = this.openSignal.asReadonly();
  readonly storageView = this.storageViewSignal.asReadonly();
  readonly tab = this.tabSignal.asReadonly();
  readonly contact = this.contactSignal.asReadonly();
  readonly media = this.mediaSignal.asReadonly();
  readonly docs = this.docsSignal.asReadonly();
  readonly links = this.linksSignal.asReadonly();
  readonly hasMore = this.hasMoreSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  show (): void {
    const conversationId = this.chat.activeId();
    if (!conversationId) return;

    this.reset();
    this.openSignal.set(true);
    this.api.contact({ conversationId }).subscribe({ next: card => this.contactSignal.set(card), error: () => undefined });
    this.storage.load();
    this.stars.load();
    this.loadPage({ tab: this.tabSignal() });
  }

  hide (): void {
    this.openSignal.set(false);
    this.storageViewSignal.set(false);
  }

  showStorage (visible: boolean): void {
    this.storageViewSignal.set(visible);
    if (visible) this.storage.load();
  }

  selectTab ({ tab }: PanelTabRefDto): void {
    this.tabSignal.set(tab);
    if (this.itemsOf({ tab }).length === 0) this.loadPage({ tab });
  }

  loadMore (): void {
    const tab = this.tabSignal();
    if (this.hasMoreSignal()[tab] && !this.loadingSignal()) this.loadPage({ tab });
  }

  private loadPage ({ tab }: PanelTabRefDto): void {
    const conversationId = this.chat.activeId();
    if (!conversationId || !(SUPPORT_PANEL.PAGED_TABS as readonly string[]).includes(tab)) return;

    const cursor = PanelPagingHelper.cursor({ items: this.itemsOf({ tab }) });
    this.loadingSignal.set(true);
    this.api.page<PanelItem>({ conversationId, tab, ...cursor }).subscribe({
      next: items => {
        this.loadingSignal.set(false);
        this.append({ tab, items });
        this.hasMoreSignal.update(state => ({ ...state, [tab]: PanelPagingHelper.hasMore({ items }) }));
      },
      error: () => {
        this.loadingSignal.set(false);
        this.toast.error(SUPPORT_PANEL.LOAD_FAILED);
      }
    });
  }

  private append ({ tab, items }: PanelAppendDto): void {
    if (tab === SUPPORT_PANEL.TABS.LINKS) this.linksSignal.update(list => [...list, ...(items as MessageLink[])]);
    else if (tab === SUPPORT_PANEL.TABS.DOCS) this.docsSignal.update(list => [...list, ...(items as SupportMessage[])]);
    else this.mediaSignal.update(list => [...list, ...(items as SupportMessage[])]);
  }

  private itemsOf ({ tab }: PanelTabRefDto): CursorItem[] {
    if (tab === SUPPORT_PANEL.TABS.LINKS) return this.linksSignal();
    if (tab === SUPPORT_PANEL.TABS.DOCS) return this.docsSignal();
    return tab === SUPPORT_PANEL.TABS.MEDIA ? this.mediaSignal() : this.stars.starred().map(item => ({ id: item.messageId, createdAt: item.createdAt }));
  }

  private reset (): void {
    this.contactSignal.set(null);
    this.mediaSignal.set([]);
    this.docsSignal.set([]);
    this.linksSignal.set([]);
    this.hasMoreSignal.set({});
    this.storageViewSignal.set(false);
  }
}
