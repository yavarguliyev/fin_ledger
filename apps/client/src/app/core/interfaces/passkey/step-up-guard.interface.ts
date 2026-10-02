import { Observable } from 'rxjs';

export interface StepUpGuardDto<T> {
  request: Observable<T>;
  confirm: () => Promise<boolean>;
}
