import { Directive, ElementRef, OnDestroy, OnInit, effect, inject, input, output } from '@angular/core';

import { CHAT_SCROLL } from '../constants/chat-scroll.constant';
import { ScrollAnchor } from '../interfaces/scroll-anchor.interface';

@Directive({
  selector: '[appChatScroll]',
  standalone: true,
  host: { '(scroll)': 'onScroll()' }
})
export class ChatScrollDirective implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly resize = new ResizeObserver(() => this.follow());
  private readonly children = new MutationObserver(() => this.watchContent());
  private stickToBottom = true;
  private anchor: ScrollAnchor | null = null;

  readonly conversationId = input<string | null>(null, { alias: 'appChatScroll' });
  readonly canLoadMore = input(false);
  readonly loadingOlder = input(false);
  readonly reachedTop = output<void>();

  constructor () {
    effect(() => {
      this.conversationId();
      this.stickToBottom = true;
      this.anchor = null;
    });

    effect(() => {
      if (this.loadingOlder() || !this.anchor) return;
      requestAnimationFrame(() => requestAnimationFrame(() => (this.anchor = null)));
    });
  }

  ngOnInit (): void {
    this.children.observe(this.host.nativeElement, { childList: true });
    this.watchContent();
  }

  ngOnDestroy (): void {
    this.resize.disconnect();
    this.children.disconnect();
  }

  onScroll (): void {
    const element = this.host.nativeElement;
    this.stickToBottom = element.scrollHeight - element.scrollTop - element.clientHeight < CHAT_SCROLL.BOTTOM_THRESHOLD_PX;

    if (element.scrollTop > CHAT_SCROLL.TOP_THRESHOLD_PX || !this.canLoadMore() || this.loadingOlder() || this.anchor) return;
    this.anchor = { height: element.scrollHeight, top: element.scrollTop };
    this.reachedTop.emit();
  }

  private watchContent (): void {
    this.resize.disconnect();
    const content = this.host.nativeElement.firstElementChild;
    if (content) this.resize.observe(content);
    this.follow();
  }

  private follow (): void {
    const element = this.host.nativeElement;
    if (this.anchor) element.scrollTop = element.scrollHeight - this.anchor.height + this.anchor.top;
    else if (this.stickToBottom) element.scrollTop = element.scrollHeight;
  }
}
