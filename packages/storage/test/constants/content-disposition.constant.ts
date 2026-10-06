export const CONTENT_DISPOSITION_TEST = {
  INLINE: 'inline',
  ATTACHMENT: 'attachment',
  PLAIN_NAME: 'statement.pdf',
  PLAIN_HEADER: 'attachment; filename="statement.pdf"; filename*=UTF-8\'\'statement.pdf',
  TRICKY_NAME: 'çek "final".pdf',
  TRICKY_HEADER: 'attachment; filename="_ek _final_.pdf"; filename*=UTF-8\'\'%C3%A7ek%20%22final%22.pdf',
  BLANK_NAME: '   ',
  FALLBACK_HEADER: 'attachment; filename="download"; filename*=UTF-8\'\'download'
} as const;
