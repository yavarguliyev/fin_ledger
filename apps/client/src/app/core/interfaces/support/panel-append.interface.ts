import { PanelItem } from '../../types/support/panel-item.type';
import { PanelTabRefDto } from './panel-tab-ref.interface';

export interface PanelAppendDto extends PanelTabRefDto {
  items: PanelItem[];
}
