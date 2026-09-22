export interface UploadFile {
  readonly buffer: Buffer;
  readonly mimetype: string;
  readonly originalname: string;
}
