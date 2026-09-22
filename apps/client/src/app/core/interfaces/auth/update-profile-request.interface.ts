export interface UpdateProfileRequest {
  displayName?: string;
  currency?: string;
  profileImages?: string[];
  profileImageIndex?: number;
  profileImagesKey?: string;
  imageAction?: 'add' | 'delete_all' | 'delete_by_index';
  deleteIndexes?: number[];
}
