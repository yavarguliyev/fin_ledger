import { Injectable, signal } from '@angular/core';

import { ProfilePhoto } from '../../../core/interfaces/support/profile-photo.interface';
import { ProfilePhotoRequestDto } from '../../../core/interfaces/support/profile-photo-request.interface';

@Injectable({ providedIn: 'root' })
export class ProfilePhotoService {
  private readonly photoSignal = signal<ProfilePhoto | null>(null);

  readonly photo = this.photoSignal.asReadonly();

  open ({ url, name }: ProfilePhotoRequestDto): void {
    if (url) this.photoSignal.set({ url, name });
  }

  close (): void {
    this.photoSignal.set(null);
  }
}
