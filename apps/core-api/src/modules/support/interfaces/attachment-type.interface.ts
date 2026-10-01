import { SupportMessageKind } from '@common/libs';

import { ByteSignature } from './byte-signature.interface';

export interface AttachmentType {
  mime: string;
  kind: SupportMessageKind;
  signature: readonly ByteSignature[];
}
