export const HTML_META = {
  TITLE: /<title[^>]*>([^<]*)<\/title>/i,
  META_TAG: /<meta\b[^>]*>/gi,
  ATTRIBUTE: /([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g,
  PROPERTY_KEYS: ['property', 'name'],
  CONTENT_KEY: 'content',
  OG_TITLE: 'og:title',
  OG_DESCRIPTION: 'og:description',
  OG_IMAGE: 'og:image',
  DESCRIPTION: 'description',
  ENTITIES: { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'" },
  ENTITY: /&(amp|lt|gt|quot|#39|#x27);/g,
  WHITESPACE: /\s+/g,
  SPACE: ' ',
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 300
} as const;
