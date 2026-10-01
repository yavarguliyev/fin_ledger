import { Injectable } from '@angular/core';

import { DEVICE } from '../constants/device/device.constant';
import { UuidHelper } from '../helpers/common/uuid.helper';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private cached: string | null = null;

  id (): string {
    if (this.cached) return this.cached;
    this.cached = this.read() ?? this.issue();
    return this.cached;
  }

  private read (): string | null {
    try {
      return localStorage.getItem(DEVICE.STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private issue (): string {
    const id = UuidHelper.generate();

    try {
      localStorage.setItem(DEVICE.STORAGE_KEY, id);
    } catch {
      return id;
    }

    return id;
  }
}
