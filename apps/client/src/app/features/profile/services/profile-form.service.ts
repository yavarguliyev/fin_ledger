import { Injectable, signal } from '@angular/core';

import { ShowMoreConfig } from '../../../core/interfaces/ui/show-more-config.interface';
import { VisibleImages } from '../../../core/interfaces/auth/visible-images.interface';
import { ProfileFields } from '../../../core/types/auth/profile-fields.type';
import { ProfileFieldsHelper } from '../helpers/profile-fields.helper';
import { PROFILE } from '../../../core/constants/profile/profile.constant';

@Injectable()
export class ProfileFormService {
  private readonly initialValues = signal<ProfileFields | null>(null);
  readonly isFormChanged = signal(false);
  readonly imagesPage = signal(1);
  readonly imagesPageSize = signal<number>(PROFILE.IMAGES_PAGE_SIZE);

  setInitialValues (fields: ProfileFields): void {
    this.initialValues.set(ProfileFieldsHelper.normalize({ fields }));
    this.isFormChanged.set(false);
  }

  checkIfChanged (fields: ProfileFields): void {
    const initial = this.initialValues();
    if (initial === null) return;
    this.isFormChanged.set(ProfileFieldsHelper.hasChanged({ initial, current: fields }));
  }

  loadMoreImages (): void {
    this.imagesPage.update(page => page + 1);
  }

  resetImagesPage (): void {
    this.imagesPage.set(1);
  }

  getVisibleImages (allImages: Array<VisibleImages>): Array<VisibleImages> {
    return allImages.slice(0, this.imagesPage() * this.imagesPageSize());
  }

  getShowMoreConfig (totalItems: number): ShowMoreConfig {
    return { pageSize: this.imagesPageSize(), currentPage: this.imagesPage(), totalItems };
  }
}
