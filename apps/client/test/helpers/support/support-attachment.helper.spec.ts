import { SupportAttachmentHelper } from '../../../src/app/core/helpers/support/support-attachment.helper';
import { SUPPORT_ATTACHMENT } from '../../../src/app/core/constants/support/support-attachment.constant';
import { SUPPORT_ATTACHMENT_TEST } from '../../constants/support-attachment.constant';

const file = (bytes: number, type: string): File => new File([new Uint8Array(bytes)], SUPPORT_ATTACHMENT_TEST.NAME, { type });

describe('SupportAttachmentHelper', () => {
  it('accepts a small image', () => {
    expect(SupportAttachmentHelper.problemWith({ files: [file(SUPPORT_ATTACHMENT_TEST.SMALL_BYTES, SUPPORT_ATTACHMENT_TEST.PNG_TYPE)] })).toBeNull();
  });

  it('refuses more files than one send allows', () => {
    const files = Array.from({ length: SUPPORT_ATTACHMENT_TEST.TOO_MANY }, () => file(SUPPORT_ATTACHMENT_TEST.SMALL_BYTES, SUPPORT_ATTACHMENT_TEST.PNG_TYPE));

    expect(SupportAttachmentHelper.problemWith({ files })).toBe(SUPPORT_ATTACHMENT.TOO_MANY_FILES);
  });

  it('refuses a file over the size limit and a type that is not allowed', () => {
    expect(SupportAttachmentHelper.problemWith({ files: [file(SUPPORT_ATTACHMENT_TEST.OVER_LIMIT_BYTES, SUPPORT_ATTACHMENT_TEST.PNG_TYPE)] })).toBe(
      SUPPORT_ATTACHMENT.TOO_LARGE
    );
    expect(SupportAttachmentHelper.problemWith({ files: [file(SUPPORT_ATTACHMENT_TEST.SMALL_BYTES, SUPPORT_ATTACHMENT_TEST.EXE_TYPE)] })).toBe(
      SUPPORT_ATTACHMENT.WRONG_TYPE
    );
  });

  it('formats file sizes the way a chat shows them', () => {
    expect(SupportAttachmentHelper.formatSize({ bytes: SUPPORT_ATTACHMENT_TEST.BYTES })).toBe(SUPPORT_ATTACHMENT_TEST.BYTES_LABEL);
    expect(SupportAttachmentHelper.formatSize({ bytes: SUPPORT_ATTACHMENT_TEST.KILOBYTES })).toBe(SUPPORT_ATTACHMENT_TEST.KILOBYTES_LABEL);
    expect(SupportAttachmentHelper.formatSize({ bytes: SUPPORT_ATTACHMENT_TEST.MEGABYTES })).toBe(SUPPORT_ATTACHMENT_TEST.MEGABYTES_LABEL);
  });
});
