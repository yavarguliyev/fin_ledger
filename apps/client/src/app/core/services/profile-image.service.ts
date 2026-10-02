import { Injectable, inject, signal, computed } from '@angular/core';

import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { ImageFilesDto } from '../interfaces/profile/image-files.interface';
import { IMAGE_UPLOAD } from '../constants/profile/image-upload.constant';
import { UploadNoticeDto } from '../interfaces/profile/upload-notice.interface';
import { ImageUploadHelper } from '../helpers/profile/image-upload.helper';
import { ErrorMessageHelper } from '../helpers/http/error-message.helper';
import { ImageIndexDto } from '../interfaces/ui/image-index.interface';

@Injectable({ providedIn: 'root' })
export class ProfileImageService {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly imageUrls = signal<Array<{ index: number; url: string; path: string }>>([]);
  readonly isUploading = signal(false);

  readonly currentUser = computed(() => this.auth.currentUser());
  readonly profileImages = computed(() => this.currentUser()?.profileImages ?? []);
  readonly profileImageIndex = computed(() => this.currentUser()?.profileImageIndex ?? 0);
  readonly profileImagesKey = computed(() => this.currentUser()?.profileImagesKey);
  readonly hasImages = computed(() => this.profileImages().length > 0);

  setMainImage (index: number): void {
    this.userService.updateProfile({ profileImageIndex: index }).subscribe({
      next: () => this.toast.success('Main image updated'),
      error: () => this.toast.error('Failed to set main image')
    });
  }

  getMainImageUrl (): string | null {
    const urls = this.imageUrls();
    const mainIndex = this.profileImageIndex();
    const mainImage = urls.find(img => img.index === mainIndex);

    return mainImage?.url ?? null;
  }

  loadImageUrls (): void {
    const key = this.profileImagesKey();
    if (!key) {
      this.imageUrls.set([]);
      return;
    }

    this.userService.getImageUrl().subscribe({
      next: response => this.imageUrls.set(response.files),
      error: () => this.imageUrls.set([])
    });
  }

  deleteAllImages (): void {
    this.toast.confirm({
      message: 'Are you sure you want to delete all profile images?',
      onConfirm: () => this.applyDeleteAll()
    });
  }

  deleteImage (index: number): void {
    this.toast.confirm({
      message: 'Are you sure you want to delete this image?',
      onConfirm: () => this.applyDeleteImage({ index })
    });
  }

  uploadImages (files: File[]): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.isUploading.set(true);
    this.send({ files });
  }

  private send ({ files }: ImageFilesDto): void {
    this.userService.uploadImages(files).subscribe({
      next: response => {
        this.userService.updateProfile({ profileImages: response.files, imageAction: 'add' }).subscribe({
          next: () => {
            this.isUploading.set(false);
            const partial = ImageUploadHelper.partialMessage({ uploaded: response.files.length, rejected: response.rejected ?? [] });
            setTimeout(() => this.refreshAfterUpload({ partial }), IMAGE_UPLOAD.REFRESH_DELAY_MS);
          },
          error: (error: unknown) => {
            this.isUploading.set(false);
            this.toast.error(ErrorMessageHelper.from({ error, fallback: IMAGE_UPLOAD.ATTACH_FAILED }));
          }
        });
      },
      error: (error: unknown) => {
        this.isUploading.set(false);
        this.toast.error(ImageUploadHelper.messageFor({ error, files }));
      }
    });
  }

  private refreshAfterUpload ({ partial }: UploadNoticeDto): void {
    const announce = (): void => (partial ? this.toast.warning(partial) : this.toast.success(IMAGE_UPLOAD.UPLOADED));

    this.userService.getImageUrl().subscribe({
      next: imageResponse => {
        this.imageUrls.set(imageResponse.files);
        announce();
      },
      error: () => {
        this.loadImageUrls();
        announce();
      }
    });
  }


  private applyDeleteAll (): void {
    this.userService.updateProfile({ imageAction: 'delete_all' }).subscribe({
      next: () => {
        this.imageUrls.set([]);
        this.toast.success('All images deleted');
      },
      error: () => this.toast.error('Failed to delete images')
    });
  }

  private applyDeleteImage ({ index }: ImageIndexDto): void {
    this.userService.updateProfile({ imageAction: 'delete_by_index', deleteIndexes: [index] }).subscribe({
      next: () => {
        const remaining = this.imageUrls().filter(img => img.index !== index);
        this.imageUrls.set(remaining.map((img, newIndex) => ({ ...img, index: newIndex })));
        this.toast.success('Image deleted');
      },
      error: () => this.toast.error('Failed to delete image')
    });
  }
}
