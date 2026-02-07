
# Premium PDF Template System: Museum-Quality Memory Book

## Overview

This plan transforms the current PDF generation from a single-layout MVP into a sophisticated, archival-quality system with **four intentional page templates** and a **signature spread** feature. The result will feel like a museum catalog or fine art memoir, not a scrapbook.

---

## The Four Page Templates

### Template 1: Full-Bleed Hero Image
```text
+----------------------------------+
|                                  |
|                                  |
|        [FULL BLEED IMAGE]        |
|                                  |
|                                  |
|                                  |
|                                  |
|   Small caption, bottom left     |
+----------------------------------+
```
- One image only, full page coverage
- No margins (true bleed to edge)
- Optional small caption (neutral sans-serif, 8pt)
- Cinematic, reverent feeling
- Best for: powerful single photos, milestone moments

### Template 2: Image + Reflection
```text
+----------------------------------+
|                                  |
|    +------------------------+    |
|    |                        |    |
|    |      [IMAGE 60%]       |    |
|    |                        |    |
|    +------------------------+    |
|                                  |
|    Reflection text in serif,     |
|    generous line spacing,        |
|    maximum 120 words.            |
|                                  |
+----------------------------------+
```
- Image occupies max 60% of content area
- Short reflection text (120 word max)
- Serif body font, 1.5x line spacing
- Consistent margin grid alignment
- Best for: photos with thoughtful context

### Template 3: Long-Form Story Page
```text
+----------------------------------+
|                                  |
|  D rop cap opening letter        |
|    followed by flowing body      |
|    text in a classic serif       |
|    font, left aligned with       |
|    wide margins for readability  |
|    and permanence. Maximum       |
|    500 words per page.           |
|                                  |
|                                  |
|                                  |
+----------------------------------+
```
- Text-only page for longer narratives
- Left-aligned serif body font
- Optional drop cap at section starts
- Wide margins (30mm+ on sides)
- Maximum 500 words
- Best for: letters, stories, reflections

### Template 4: Timeline/Highlights Page
```text
+----------------------------------+
|                                  |
|    TRANSFERS & COMPANIONS        |
|    ─────────────────────         |
|                                  |
|    January 2024                  |
|    · First companion: Elder Smith|
|    · Arrived in São Paulo        |
|                                  |
|    March 2024                    |
|    · Transfer to Curitiba        |
|    · New companion: Elder Jones  |
|                                  |
|    ...                           |
|                                  |
+----------------------------------+
```
- Structured list or timeline format
- Minimal dots for visual guidance
- No icons, no illustrations
- Documentary, restrained aesthetic
- Best for: transfers, companions, milestones, lessons learned

---

## Signature Spread (Emotional Centerpiece)

A repeatable two-page spread that marks emotional turning points:

```text
+----------------------------------+----------------------------------+
|                                  |                                  |
|                                  |                                  |
|                                  |    "A single powerful           |
|        [FULL-BLEED PHOTO]        |     reflection or lesson,       |
|        or quiet negative         |     80 words maximum,           |
|        space                     |     centered vertically,        |
|                                  |     no headline, no             |
|                                  |     decoration."                |
|                                  |                                  |
+----------------------------------+----------------------------------+
```
- Left page: full-bleed image or peaceful negative space
- Right page: single paragraph (max 80 words), centered
- No headline, no decoration
- Appears once per major emotional section
- Identical structure each time, only content changes

---

## Database Schema Changes

### New Column: `page_template`

Add to the `pages` table:

| Column | Type | Default | Values |
|--------|------|---------|--------|
| `page_template` | `text` | `'image_reflection'` | `'hero_image'`, `'image_reflection'`, `'story'`, `'timeline'`, `'signature_left'`, `'signature_right'` |

### New Column: `caption`

Add to the `pages` table for hero image captions:

| Column | Type | Default |
|--------|------|---------|
| `caption` | `text` | `null` |

### New Column: `is_signature_spread`

Add to the `pages` table:

| Column | Type | Default |
|--------|------|---------|
| `is_signature_spread` | `boolean` | `false` |

---

## PDF Style Guide Implementation

### Typography Constants
```typescript
const TYPOGRAPHY = {
  body: {
    font: 'TimesRoman',
    size: 11, // 10.5-11.5pt
    lineHeight: 1.5, // 1.45x minimum
  },
  caption: {
    font: 'Helvetica', // neutral sans-serif
    size: 8,
    color: WARM_GRAY,
  },
  dropCap: {
    font: 'TimesRomanBold',
    size: 48,
    lines: 3, // spans 3 lines
  },
};
```

### Color Palette (Strict)
```typescript
const PDF_COLORS = {
  text: rgb(0.169, 0.169, 0.165),      // warm charcoal #2B2B2A
  background: rgb(1, 1, 1),             // pure white
  backgroundAlt: rgb(0.98, 0.97, 0.96), // soft off-white
  accent: rgb(0.722, 0.651, 0.416),     // muted gold (dividers only)
  caption: rgb(0.4, 0.4, 0.4),          // quiet gray
};
```

### Spacing Constants
```typescript
const MARGINS = {
  outer: mmToPoints(20),     // generous outer margin
  inner: mmToPoints(25),     // increased for binding
  top: mmToPoints(25),
  bottom: mmToPoints(20),
};

const BLEED = mmToPoints(3); // 3mm bleed for full-bleed pages
```

---

## Implementation Components

### 1. Template Selection UI

**File:** `src/components/vault/CreatePageDialog.tsx`

Add template selector with visual previews:
- Four template cards with mini diagrams
- "Signature Spread" toggle (owner-only)
- Dynamic form fields based on template:
  - Hero: image + optional caption
  - Image+Reflection: image + short text (120 word limit)
  - Story: text only (500 word limit) + optional drop cap
  - Timeline: structured entries

### 2. Template-Specific Form Fields

**Hero Image Template:**
- Single image upload (required)
- Caption field (optional, 50 char max)

**Image + Reflection Template:**
- Single image upload (required)
- Reflection text (required, 120 word max)

**Story Template:**
- Text only (required, 500 word max)
- Drop cap toggle

**Timeline Template:**
- Section title
- Timeline entries (date + description pairs)

### 3. PDF Generator Updates

**File:** `supabase/functions/generate-pdf/index.ts`

Create template-specific rendering functions:

```typescript
// Template renderers
const renderHeroImage = (page, data) => { ... };
const renderImageReflection = (page, data) => { ... };
const renderStory = (page, data) => { ... };
const renderTimeline = (page, data) => { ... };
const renderSignatureSpread = (pdfDoc, data) => { ... };
```

### 4. Image Processing

All images processed consistently:
- Unified tone adjustment (slight warmth)
- Consistent saturation level
- No borders, shadows, or effects
- 300 DPI minimum for print quality

### 5. PDF Metadata

Embed metadata for archival purposes:
```typescript
pdfDoc.setTitle(`${vault.recipient_name} - Mission Memory Vault`);
pdfDoc.setAuthor('Mission Memory Vault');
pdfDoc.setSubject(vault.mission_name || 'Mission Memory Book');
pdfDoc.setCreator('Mission Memory Vault');
pdfDoc.setCreationDate(new Date());
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/vault/TemplateSelector.tsx` | Visual template picker component |
| `src/components/vault/TimelineEditor.tsx` | Timeline entries editor |
| `src/lib/pdfTemplates.ts` | Template constants and types |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/vault/CreatePageDialog.tsx` | Add template selection, dynamic forms |
| `src/components/vault/EditPageDialog.tsx` | Same template system for editing |
| `src/components/vault/PageCard.tsx` | Show template type indicator |
| `src/components/vault/BookPreview.tsx` | Render different templates in preview |
| `src/hooks/usePages.tsx` | Handle new fields (template, caption) |
| `supabase/functions/generate-pdf/index.ts` | Complete rewrite with 4 template renderers |

## Database Migration

```sql
-- Add page template support
ALTER TABLE pages 
  ADD COLUMN page_template text DEFAULT 'image_reflection',
  ADD COLUMN caption text,
  ADD COLUMN is_signature_spread boolean DEFAULT false,
  ADD COLUMN timeline_data jsonb;

-- Add constraint for valid templates
ALTER TABLE pages 
  ADD CONSTRAINT valid_page_template 
  CHECK (page_template IN ('hero_image', 'image_reflection', 'story', 'timeline'));
```

---

## User Flow Changes

### Current Flow
```text
Add Page → Title + Content + Images → Submit
```

### New Flow
```text
Add Page → Choose Template → Fill Template-Specific Fields → Submit
```

### Template Selection Screen
```text
+----------------------------------------+
|          Choose a Page Layout          |
|                                        |
|  +--------+  +--------+  +--------+    |
|  | HERO   |  | IMAGE  |  | STORY  |    |
|  | [img]  |  | [img]  |  | [text] |    |
|  |        |  | text   |  |        |    |
|  +--------+  +--------+  +--------+    |
|                                        |
|  +--------+                            |
|  |TIMELINE|  [ ] Mark as Signature     |
|  | · item |      Spread (owner only)   |
|  | · item |                            |
|  +--------+                            |
+----------------------------------------+
```

---

## Technical Considerations

### Character/Word Limits by Template
| Template | Image | Text Limit |
|----------|-------|------------|
| Hero Image | 1 (required) | Caption: 50 chars |
| Image + Reflection | 1 (required) | 120 words |
| Story | None | 500 words |
| Timeline | None | Entries: 20 max |
| Signature (left) | 1 (optional) | None |
| Signature (right) | None | 80 words |

### Backwards Compatibility
- Existing pages default to `'image_reflection'` template
- Current multi-image pages rendered in grid within image area
- No data loss during migration

### Print Specifications
- 300 DPI minimum resolution
- 3mm bleed on full-bleed pages
- Fonts fully embedded (no subsetting issues)
- CMYK-safe colors (no neon/RGB-only)

---

## Expected Outcome

After implementation:
- **Four distinct, intentional layouts** - Each with clear purpose
- **Museum-catalog quality** - Not a scrapbook aesthetic
- **Signature spreads** - Emotional centerpieces that slow the reader
- **Typographic discipline** - Consistent hierarchy throughout
- **Print-ready output** - 300 DPI, embedded fonts, proper bleeds
- **Archival metadata** - Title, author, mission name embedded
- **Editorial feel** - Timeless, designed to last generations

The result: A premium memory book that feels like it belongs in a museum gift shop, not a photo printing kiosk.
