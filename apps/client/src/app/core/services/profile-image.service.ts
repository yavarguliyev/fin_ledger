import { Injectable, inject, signal, computed } from '@angular/core';

import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

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
    this.toast.confirm('Are you sure you want to delete all profile images?', () => {
      this.userService.updateProfile({ imageAction: 'delete_all' }).subscribe({
        next: () => {
          this.imageUrls.set([]);
          this.toast.success('All images deleted');
        },
        error: () => this.toast.error('Failed to delete images')
      });
    });
  }

  deleteImage (index: number): void {
    this.toast.confirm('Are you sure you want to delete this image?', () => {
      this.userService.updateProfile({ imageAction: 'delete_by_index', deleteIndexes: [index] }).subscribe({
        next: () => {
          const currentUrls = this.imageUrls();
          const updatedUrls = currentUrls.filter(img => img.index !== index).map((img, newIndex) => ({ ...img, index: newIndex }));
          this.imageUrls.set(updatedUrls);
          this.toast.success('Image deleted');
        },
        error: () => this.toast.error('Failed to delete image')
      });
    });
  }

  uploadImages (files: File[]): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const key = `user-${user.id}`;
    this.isUploading.set(true);

    this.userService.uploadImages(files).subscribe({
      next: response => {
        this.userService.updateProfile({ profileImages: response.files, profileImagesKey: key, imageAction: 'add' }).subscribe({
          next: () => {
            this.isUploading.set(false);
            setTimeout(() => {
              this.userService.getImageUrl().subscribe({
                next: imageResponse => {
                  this.imageUrls.set(imageResponse.files);
                  this.toast.success('Images uploaded successfully');
                },
                error: () => {
                  this.loadImageUrls();
                  this.toast.success('Images uploaded successfully');
                }
              });
            }, 500);
          },
          error: () => {
            this.isUploading.set(false);
            this.toast.error('Failed to update profile with new images');
          }
        });
      },
      error: () => {
        this.isUploading.set(false);
        this.toast.error('Failed to upload images');
      }
    });
  }
}
