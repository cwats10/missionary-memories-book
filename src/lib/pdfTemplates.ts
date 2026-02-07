// PDF Template System - Museum-Quality Memory Book
// Four intentional page templates for archival-quality output

export type PageTemplate = 'hero_image' | 'image_reflection' | 'story' | 'timeline';

export interface TimelineEntry {
  date: string;
  description: string;
}

// Template limits and specifications
export const TEMPLATE_SPECS = {
  hero_image: {
    name: 'Full-Bleed Hero',
    description: 'Cinematic full-page image with optional caption',
    imageRequired: true,
    maxImages: 1,
    captionMaxChars: 50,
    textMaxWords: 0,
    icon: 'image',
  },
  image_reflection: {
    name: 'Image + Reflection',
    description: 'Photo with thoughtful reflection text',
    imageRequired: true,
    maxImages: 1,
    captionMaxChars: 0,
    textMaxWords: 120,
    icon: 'layout',
  },
  story: {
    name: 'Long-Form Story',
    description: 'Text-only narrative with optional drop cap',
    imageRequired: false,
    maxImages: 0,
    captionMaxChars: 0,
    textMaxWords: 500,
    icon: 'file-text',
  },
  timeline: {
    name: 'Timeline / Highlights',
    description: 'Structured list for milestones and companions',
    imageRequired: false,
    maxImages: 0,
    captionMaxChars: 0,
    textMaxWords: 0,
    maxEntries: 20,
    icon: 'list',
  },
} as const;

// PDF Typography Constants (matching PDF generator)
export const PDF_TYPOGRAPHY = {
  body: {
    font: 'TimesRoman',
    size: 11,
    lineHeight: 1.5,
  },
  caption: {
    font: 'Helvetica',
    size: 8,
  },
  dropCap: {
    font: 'TimesRomanBold',
    size: 48,
    lines: 3,
  },
  title: {
    font: 'TimesRomanBold',
    size: 26,
  },
  attribution: {
    font: 'TimesRomanItalic',
    size: 14,
  },
};

// PDF Color Palette (strict neutral palette)
export const PDF_COLORS = {
  text: '#2B2B2A',           // warm charcoal
  background: '#FFFFFF',      // pure white
  backgroundAlt: '#F4F1EC',   // soft off-white (bone parchment)
  accent: '#B8A66A',          // muted gold (dividers only)
  caption: '#666666',         // quiet gray
};

// PDF Spacing Constants
export const PDF_SPACING = {
  marginOuter: 20,     // mm - generous outer margin
  marginInner: 25,     // mm - increased for binding
  marginTop: 25,       // mm
  marginBottom: 20,    // mm
  bleed: 3,            // mm - for full-bleed pages
};

// Utility: Count words in text
export const countWords = (text: string): number => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

// Utility: Validate template content
export const validateTemplateContent = (
  template: PageTemplate,
  content: {
    text?: string;
    images?: string[];
    caption?: string;
    timelineData?: TimelineEntry[];
    hasDropCap?: boolean;
  }
): { valid: boolean; errors: string[] } => {
  const spec = TEMPLATE_SPECS[template];
  const errors: string[] = [];

  // Image validation
  if (spec.imageRequired && (!content.images || content.images.length === 0)) {
    errors.push('This template requires an image.');
  }
  if (content.images && content.images.length > spec.maxImages) {
    errors.push(`Maximum ${spec.maxImages} image${spec.maxImages === 1 ? '' : 's'} allowed.`);
  }

  // Caption validation (hero_image only)
  if (template === 'hero_image' && content.caption) {
    if (content.caption.length > spec.captionMaxChars) {
      errors.push(`Caption must be ${spec.captionMaxChars} characters or less.`);
    }
  }

  // Text/word validation
  if (spec.textMaxWords > 0 && content.text) {
    const wordCount = countWords(content.text);
    if (wordCount > spec.textMaxWords) {
      errors.push(`Text must be ${spec.textMaxWords} words or less (currently ${wordCount}).`);
    }
  }

  // Timeline validation
  if (template === 'timeline') {
    if (!content.timelineData || content.timelineData.length === 0) {
      errors.push('Timeline requires at least one entry.');
    } else if (content.timelineData.length > (spec as typeof TEMPLATE_SPECS['timeline']).maxEntries) {
      errors.push(`Maximum ${(spec as typeof TEMPLATE_SPECS['timeline']).maxEntries} timeline entries allowed.`);
    }
  }

  return { valid: errors.length === 0, errors };
};

// Get template display info for UI
export const getTemplateDisplayInfo = (template: PageTemplate) => {
  return TEMPLATE_SPECS[template];
};

// Default template for new pages
export const DEFAULT_TEMPLATE: PageTemplate = 'image_reflection';
