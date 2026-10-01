import { RowRefDto } from '../../dtos/ui/row-ref.dto';

export interface ActionConfig<T = unknown> {
  view?: boolean;
  update?: boolean;
  delete?: boolean;
  deleteLabel?: string;

  onView?: (dto: RowRefDto<T>) => void;
  onUpdate?: (dto: RowRefDto<T>) => void;
  onDelete?: (dto: RowRefDto<T>) => void;
}
