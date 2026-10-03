import { FileTransferHelper } from '../../../src/app/features/support/helpers/file-transfer.helper';
import { FILE_DROP_TEST as T } from '../../constants/file-drop.constant';
import { aDataTransfer } from '../../fakes/dom.fake';

const file = new File([T.CONTENT], T.FILE_NAME, { type: T.FILE_TYPE });

const transfer = (types: string[], files: File[]): Pick<DataTransfer, 'files' | 'types'> => aDataTransfer({ types, files });

describe('FileTransferHelper', () => {
  it('recognises a drag or paste that carries files', () => {
    expect(FileTransferHelper.hasFiles({ transfer: transfer([T.FILES], [file]) })).toBe(true);
  });

  it('ignores dragged or pasted text', () => {
    expect(FileTransferHelper.hasFiles({ transfer: transfer([T.TEXT], []) })).toBe(false);
    expect(FileTransferHelper.hasFiles({ transfer: null })).toBe(false);
  });

  it('returns the carried files, or none', () => {
    expect(FileTransferHelper.files({ transfer: transfer([T.FILES], [file]) })).toEqual([file]);
    expect(FileTransferHelper.files({ transfer: null })).toEqual([]);
  });
});
