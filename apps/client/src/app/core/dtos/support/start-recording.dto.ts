import type { RecordingKind } from '../../types/support/recording-kind.type';

export interface StartRecordingDto {
  kind: RecordingKind;
  onLimit: () => void;
}
