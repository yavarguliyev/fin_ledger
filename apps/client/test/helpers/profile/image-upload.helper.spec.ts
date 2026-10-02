import { ImageUploadHelper } from '../../../src/app/core/helpers/profile/image-upload.helper';
import { HttpRequestError } from '../../../src/app/core/errors/http-request.error';
import { IMAGE_UPLOAD_SPEC as I } from '../../constants/image-upload.constant';

describe('ImageUploadHelper', () => {
  it('shows the server reason, a clear size message for 413, and the fallback otherwise', () => {
    const rejected = new HttpRequestError({ message: I.SERVER_MESSAGE, status: I.UNSUPPORTED });
    const tooLarge = new HttpRequestError({ message: I.MULTER_MESSAGE, status: I.PAYLOAD_TOO_LARGE });

    expect(ImageUploadHelper.messageFor({ error: rejected, files: [] })).toBe(I.SERVER_MESSAGE);
    expect(ImageUploadHelper.messageFor({ error: tooLarge, files: [] })).toBe(I.TOO_LARGE);
    expect(ImageUploadHelper.messageFor({ error: null, files: [] })).toBe(I.FALLBACK);
  });

  it('names each file over the limit with its size when the server answers 413', () => {
    const tooLarge = new HttpRequestError({ message: I.MULTER_MESSAGE, status: I.PAYLOAD_TOO_LARGE });
    const files = [new File([new Uint8Array(I.SMALL_BYTES)], I.SMALL_NAME), new File([new Uint8Array(I.BIG_BYTES)], I.BIG_NAME)];

    expect(ImageUploadHelper.messageFor({ error: tooLarge, files })).toBe(I.NAMED_TOO_LARGE);
  });

  it('reports how many images were uploaded and why each other one was rejected', () => {
    expect(ImageUploadHelper.partialMessage({ uploaded: I.UPLOADED, rejected: [I.RAW, I.HEIC] })).toBe(I.PARTIAL);
  });

  it('has nothing to report when every image was accepted', () => {
    expect(ImageUploadHelper.partialMessage({ uploaded: I.UPLOADED, rejected: [] })).toBeNull();
  });
});
