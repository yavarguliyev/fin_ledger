import { UploadPreviewHelper } from '../../../src/app/core/helpers/support/upload-preview.helper';
import { PENDING_UPLOAD } from '../../../src/app/core/constants/support/pending-upload.constant';
import { CHAT_FRESHNESS_TEST as T } from '../../constants/chat-freshness.constant';

describe('UploadPreviewHelper', () => {
  afterEach(() => jest.restoreAllMocks());

  it('gives photos and videos a local preview and documents none, then releases them', () => {
    const create = jest.spyOn(URL, 'createObjectURL').mockReturnValue(T.OBJECT_URL);
    const revoke = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const files = [T.IMAGE_TYPE, T.VIDEO_TYPE, T.PDF_TYPE].map((type, index) => new File([T.FILE_BYTES], `file-${index}`, { type }));

    const previews = UploadPreviewHelper.fromFiles({ files });
    UploadPreviewHelper.release({ upload: { localId: 'l', conversationId: 'c', body: '', files: previews } });

    expect(previews.map(preview => preview.kind)).toEqual([PENDING_UPLOAD.KINDS.IMAGE, PENDING_UPLOAD.KINDS.VIDEO, PENDING_UPLOAD.KINDS.FILE]);
    expect(previews.map(preview => preview.objectUrl)).toEqual([T.OBJECT_URL, T.OBJECT_URL, null]);
    expect(create).toHaveBeenCalledTimes(2);
    expect(revoke).toHaveBeenCalledTimes(2);
  });
});
