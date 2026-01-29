
# Combined Plan: 12x12 Only + Premium PDF Quality

## Overview

This plan combines two objectives into a single cohesive update:
1. **Simplify to 12×12" book size only** - Remove multi-size selection from vault creation
2. **Elevate PDF output to heirloom quality** - Add decorative elements, refined typography, and contributor attributions

---

## Part 1: Simplify to 12×12" Only

### What Changes

**User Flow (Before):**
```text
Create Vault → Choose Type → Choose Size → Enter Details → Done
```

**User Flow (After):**
```text
Create Vault → Choose Type → Enter Details → Done
```

### Files to Modify

#### 1. Type Definitions
**File:** `src/hooks/useVaults.tsx`
- Simplify `BookSize` type to single value: `'12x12'`
- Update default in `createVault` from `'9x9'` to `'12x12'`

#### 2. Vault Creation Dialog
**File:** `src/components/dashboard/CreateVaultDialog.tsx`
- Remove the entire `step === 'size'` section (lines 188-255)
- Remove `bookSizes` array (lines 45-52)
- Change flow: Type selection → Details directly
- Auto-set `book_size` to `'12x12'` when type is selected
- Remove size-related state and handlers

#### 3. Character Limits Utility
**File:** `src/lib/bookSizeLimits.ts`
- Simplify `getCharacterLimits()` to return 12x12 limits only:
  - No images: 2,200 characters
  - With images: 950 characters
- Simplify `getBookSizeLabel()` to return `"12×12\" Premium Square"`
- Keep function signatures for backwards compatibility

#### 4. Create Page Dialog
**File:** `src/components/vault/CreatePageDialog.tsx`
- Update helper text to remove dynamic size references
- Simplify messaging: "You have 2,200 characters, reduced to 950 with images."

#### 5. Edit Page Dialog
**File:** `src/components/vault/EditPageDialog.tsx`
- Same helper text simplification as CreatePageDialog

---

## Part 2: Premium PDF Quality

### Visual Structure Per Page Type

**Front Cover:**
```text
+---------------------------+
|                           |
|     [background image]    |
|                           |
|     ─────  ◆  ─────       |  <- ornamental rule with diamond
|                           |
|   MISSION MEMORY VAULT    |  <- title with letter-spacing
|                           |
|     ─────  ◆  ─────       |  <- ornamental rule with diamond
|                           |
+---------------------------+
```

**Title Page (Dedication):**
```text
+---------------------------+
|                           |
|           ✦               |  <- decorative star
|                           |
|     ─────────────         |  <- thin gold rule
|                           |
|      RECIPIENT NAME       |  <- bold, larger, tracked
|                           |
|      Mission Name         |  <- italic
|                           |
|   January 2024 — Dec 2026 |  <- dates with em-dash
|                           |
|     ─────────────         |  <- thin gold rule
|                           |
|           ✦               |  <- decorative star
|                           |
+---------------------------+
```

**Content Page:**
```text
+---------------------------+
|                           |
|       Memory Title        |  <- centered, bold
|   A memory from John Doe  |  <- italic attribution
|     ─────  ◆  ─────       |  <- small divider
|                           |
|   +-------------------+   |
|   |                   |   |
|   |      [IMAGE]      |   |  <- subtle warm border
|   |                   |   |
|   +-------------------+   |
|                           |
|   Lorem ipsum dolor sit   |
|   amet, consectetur...    |  <- body text
|                           |
|                       3   |  <- page number (outer margin)
+---------------------------+
```

**Closing Page:**
```text
+---------------------------+
|                           |
|                           |
|           ✦               |  <- decorative star
|     ─────  ◆  ─────       |  <- ornamental rule
|                           |
|   The voices, moments,    |
|   and messages that       |  <- italic text
|   shape a life-changing   |
|   journey have been       |
|   recorded...             |
|                           |
|     ─────  ◆  ─────       |  <- ornamental rule
|           ✦               |  <- decorative star
|                           |
+---------------------------+
```

### PDF Technical Changes

**File:** `supabase/functions/generate-pdf/index.ts`

#### 1. Simplify Dimensions
- Remove `getBookDimensions()` switch statement
- Hardcode 12×12" dimensions:
  - Width: 864 points (12 × 72)
  - Height: 864 points (12 × 72)
  - Margin: 28.35 points (10mm)

#### 2. Add Italic Font
- Embed `StandardFonts.TimesRomanItalic` for:
  - Contributor attributions
  - Mission name on title page
  - Closing message

#### 3. Define Gold Accent Color
- Create gold color: `rgb(0.722, 0.651, 0.416)` (#B8A66A)
- Use for ornamental lines and decorative elements

#### 4. Create Helper Functions
```text
drawOrnamentalRule(page, y, width)
  - Draws thin gold line with small diamond in center
  
drawDecorativeStar(page, x, y)
  - Draws small decorative star/asterisk
  
drawPageNumber(page, pageNum, isLeftPage)
  - Positions number in outer margin (left or right)
  
drawImageBorder(page, x, y, width, height)
  - Draws subtle warm-toned border around images
```

#### 5. Update Data Query
- Modify pages query to join with `profiles` table
- Fetch `full_name` for contributor attribution
```sql
SELECT pages.*, profiles.full_name as author_name
FROM pages
LEFT JOIN profiles ON pages.contributor_id = profiles.user_id
WHERE vault_id = $1 AND status = 'approved'
ORDER BY page_order ASC
```

#### 6. Enhanced Cover Page
- Add ornamental rules above and below title
- Increase letter-spacing simulation for title
- Keep background image handling unchanged

#### 7. Enhanced Title Page
- Add decorative stars at top and bottom
- Add thin horizontal rules above/below recipient name
- Set mission name in italic font
- Use proper em-dash for date range
- More generous vertical spacing

#### 8. Enhanced Content Pages
- Add italic attribution below title: "A memory from [Author Name]"
- Add small decorative divider below attribution
- Add subtle border around images (warm stone color)
- Add page numbers in outer margins (odd pages right, even pages left)
- Slightly increased line height for body text

#### 9. Enhanced Closing Page
- Add decorative stars and ornamental rules
- Set closing message in italic font
- Center the ornamental frame around the message

---

## Summary of All Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useVaults.tsx` | Simplify BookSize type, update default |
| `src/components/dashboard/CreateVaultDialog.tsx` | Remove size step, simplify flow |
| `src/lib/bookSizeLimits.ts` | Return 12x12 limits only |
| `src/components/vault/CreatePageDialog.tsx` | Simplify helper text |
| `src/components/vault/EditPageDialog.tsx` | Simplify helper text |
| `supabase/functions/generate-pdf/index.ts` | Major PDF elegance enhancements |

---

## Backwards Compatibility

- Existing vaults with other sizes keep their `book_size` value in database
- PDF generator defaults to 12×12 dimensions regardless of stored value
- Character limits use 12×12 values for all vaults going forward

---

## Expected Outcome

After implementation:
- **Simpler vault creation** - One less decision for users
- **Premium 12×12" format** - Large, impressive presentation
- **Elegant PDF output** - Decorative elements, refined typography
- **Contributor recognition** - Each page credits its author
- **Professional page numbering** - Elegant, unobtrusive positioning
- **Cohesive brand identity** - PDF matches website's heirloom aesthetic
