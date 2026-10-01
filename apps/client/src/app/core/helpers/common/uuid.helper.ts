import { v7 } from 'uuid';

export class UuidHelper {
  static generate (): string {
    return v7();
  }
}
