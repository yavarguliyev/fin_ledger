import { CurrentPage } from '../base/current-page.interface';
import { TotalItems } from '../base/total-items.interface';
import { TotalPages } from '../base/total-pages.interface';

export interface PaginationConfig extends TotalPages, TotalItems, CurrentPage {
  availablePageSizes: number[];
}
