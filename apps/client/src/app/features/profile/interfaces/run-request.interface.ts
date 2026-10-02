import { Observable } from 'rxjs';

export interface RunRequestDto<T> {
  request: Observable<T>;
  onSuccess: (value: T) => void;
}
