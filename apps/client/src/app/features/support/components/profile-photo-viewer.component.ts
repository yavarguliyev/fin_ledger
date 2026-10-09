import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { FocusTrapDirective } from '../../../shared/directives/focus-trap.directive';
import { PROFILE_PHOTO } from '../constants/profile-photo.constant';
import { ProfilePhotoService } from '../services/profile-photo.service';

@Component({
  selector: 'app-profile-photo-viewer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, FocusTrapDirective],
  templateUrl: '../templates/profile-photo-viewer.component.html',
  host: { '(document:keydown.escape)': 'onEscape($event)' }
})
export class ProfilePhotoViewerComponent {
  readonly photos = inject(ProfilePhotoService);
  readonly labels = PROFILE_PHOTO;

  onEscape (event: Event): void {
    if (!this.photos.photo()) return;
    event.stopImmediatePropagation();
    this.photos.close();
  }
}
