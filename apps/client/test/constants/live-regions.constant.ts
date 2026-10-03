import { join } from 'node:path';

const TEMPLATES = join(__dirname, '..', '..', 'src', 'app');

export const LIVE_REGIONS_TEST = {
  ENCODING: 'utf8',
  TOAST: join(TEMPLATES, 'layout', 'templates', 'toast.component.html'),
  CALL: join(TEMPLATES, 'layout', 'templates', 'call-overlay.component.html'),
  THREAD: join(TEMPLATES, 'features', 'support', 'templates', 'message-thread.component.html'),
  TOAST_REGION: /^<div[^>]*aria-live="polite"/,
  THREAD_REGION: /^<div[^>]*role="log"[^>]*aria-live="polite"/,
  CALL_REGION: /^<p[^>]*aria-live="assertive"[^>]*>\{\{ announcement\(\) \}\}<\/p>/,
  LIVE: 'aria-live',
  CALL_OVERLAY_START: '@if',
  PEER: 'Alex',
  INCOMING_FROM_PEER: 'Incoming voice call from Alex',
  INCOMING_VOICE: 'Incoming voice call',
  CONNECTED: 'Call connected',
  CALLING: 'Calling…',
  ELAPSED: '00:07'
} as const;
