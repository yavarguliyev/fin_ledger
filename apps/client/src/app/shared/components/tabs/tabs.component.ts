import { Component, ChangeDetectionStrategy, ElementRef, inject, input, model } from '@angular/core';

import { TABS } from '../../../core/constants/ui/tabs.constant';
import { UiPrimitiveHelper } from '../../../core/helpers/ui/ui-primitive.helper';
import { TabItemDto } from '../../../core/interfaces/ui/tab-item.interface';

@Component({
  selector: 'app-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabs.component.html'
})
export class TabsComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly tabs = input.required<TabItemDto[]>();
  readonly label = input.required<string>();
  readonly active = model.required<string>();

  readonly styles = TABS;

  classes (id: string): string {
    return UiPrimitiveHelper.tab({ active: id === this.active() });
  }

  select (id: string): void {
    this.active.set(id);
  }

  onKeydown (event: KeyboardEvent, index: number): void {
    const next = UiPrimitiveHelper.nextTab({ key: event.key, index, count: this.tabs().length });
    const target = next === null ? undefined : this.tabs()[next];
    if (!target) return;

    event.preventDefault();
    this.select(target.id);
    this.host.nativeElement.querySelector<HTMLElement>(`#${TABS.TAB_ID_PREFIX}${target.id}`)?.focus();
  }
}
