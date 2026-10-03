import { readFileSync } from 'node:fs';

import { LIVE_REGIONS_TEST as T } from '../constants/live-regions.constant';
import { SourceFileDto } from '../interfaces/source-file.interface';

const read = ({ file }: SourceFileDto): string => readFileSync(file, T.ENCODING);

describe('Screen reader announcements', () => {
  it('announces toasts from a live region that is always on the page', () => {
    expect(read({ file: T.TOAST })).toMatch(T.TOAST_REGION);
  });

  it('announces new chat messages as they arrive', () => {
    expect(read({ file: T.THREAD })).toMatch(T.THREAD_REGION);
  });

  it('announces calls from a region outside the overlay, and never the ticking call timer', () => {
    const call = read({ file: T.CALL });
    const overlay = call.slice(call.indexOf(T.CALL_OVERLAY_START));

    expect(call).toMatch(T.CALL_REGION);
    expect(overlay).not.toContain(T.LIVE);
  });
});
