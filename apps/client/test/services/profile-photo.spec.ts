import { ProfilePhotoService } from '../../src/app/features/support/services/profile-photo.service';
import { PROFILE_PHOTO_TEST as T } from '../constants/profile-photo.constant';

describe('ProfilePhotoService', () => {
  it('opens a photo with the person’s name and closes it again', () => {
    const photos = new ProfilePhotoService();
    photos.open({ url: T.URL, name: T.NAME });
    expect(photos.photo()).toEqual({ url: T.URL, name: T.NAME });

    photos.close();
    expect(photos.photo()).toBeNull();
  });

  it('does nothing for someone without a photo', () => {
    const photos = new ProfilePhotoService();
    photos.open({ url: null, name: T.NAME });

    expect(photos.photo()).toBeNull();
  });
});
