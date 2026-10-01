import { Observable } from 'rxjs';

export interface RequestRefDto<T> {
  request: Observable<T>;
}
