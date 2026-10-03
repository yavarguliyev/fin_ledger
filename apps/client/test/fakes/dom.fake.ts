import { DataTransferFakeDto, DragEventFakeDto, MouseEventFakeDto } from '../interfaces/dom-fake.interface';
import { FAKES as F } from '../constants/fakes.constant';

export const aDataTransfer = ({ types, files }: DataTransferFakeDto): Pick<DataTransfer, 'files' | 'types'> =>
  ({ types, files }) as unknown as Pick<DataTransfer, 'files' | 'types'>;

export const aDragEvent = ({ types, files, preventDefault }: DragEventFakeDto): DragEvent =>
  ({ preventDefault, dataTransfer: { types, files, dropEffect: F.NO_DROP_EFFECT } }) as unknown as DragEvent;

export const aMouseEvent = ({ target }: MouseEventFakeDto): MouseEvent => ({ target }) as unknown as MouseEvent;
