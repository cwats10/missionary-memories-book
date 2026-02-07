import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Expose-Headers': 'content-disposition',
};

// Fixed 12x12" dimensions (72 points = 1 inch)
const mmToPoints = (mm: number) => mm * 2.83465;
const PAGE_WIDTH = 12 * 72;  // 864 points
const PAGE_HEIGHT = 12 * 72; // 864 points

// Margins - generous for print quality
const MARGIN = {
  outer: mmToPoints(20),
  inner: mmToPoints(25),
  top: mmToPoints(25),
  bottom: mmToPoints(20),
};
const BLEED = mmToPoints(3);

// Color palette (strict neutral)
const COLORS = {
  text: rgb(0.169, 0.169, 0.165),      // warm charcoal #2B2B2A
  gold: rgb(0.722, 0.651, 0.416),       // muted gold #B8A66A (dividers only)
  stone: rgb(0.831, 0.784, 0.722),      // warm stone #D4C8B8
  caption: rgb(0.4, 0.4, 0.4),          // quiet gray
  interiorBg: rgb(0.957, 0.945, 0.925), // bone parchment #F4F1EC
};

// Typography constants
const TYPOGRAPHY = {
  body: { size: 11, lineHeight: 1.5 },
  caption: { size: 8 },
  dropCap: { size: 48, lines: 3 },
  title: { size: 26 },
  attribution: { size: 14 },
  heading: { size: 18 },
};

// Helper: Draw ornamental rule with diamond center
const drawOrnamentalRule = (
  page: any,
  y: number,
  centerX: number,
  width: number,
  font: any,
  color = COLORS.gold
) => {
  const halfWidth = width / 2;
  const lineThickness = 0.75;
  const diamondGap = 12;
  
  page.drawRectangle({
    x: centerX - halfWidth,
    y: y - lineThickness / 2,
    width: halfWidth - diamondGap,
    height: lineThickness,
    color,
  });
  
  page.drawRectangle({
    x: centerX + diamondGap,
    y: y - lineThickness / 2,
    width: halfWidth - diamondGap,
    height: lineThickness,
    color,
  });
  
  const diamondChar = '◆';
  const diamondWidth = font.widthOfTextAtSize(diamondChar, 8);
  page.drawText(diamondChar, {
    x: centerX - diamondWidth / 2,
    y: y - 4,
    size: 8,
    font,
    color,
  });
};

// Helper: Draw decorative star
const drawDecorativeStar = (
  page: any,
  x: number,
  y: number,
  font: any,
  color = COLORS.gold
) => {
  const starChar = '✦';
  const starWidth = font.widthOfTextAtSize(starChar, 12);
  page.drawText(starChar, {
    x: x - starWidth / 2,
    y: y - 4,
    size: 12,
    font,
    color,
  });
};

// Helper: Draw page number
const drawPageNumber = (
  page: any,
  pageNum: number,
  isLeftPage: boolean,
  font: any,
  color = COLORS.text
) => {
  const numText = String(pageNum);
  const numWidth = font.widthOfTextAtSize(numText, 10);
  const x = isLeftPage ? MARGIN.outer : PAGE_WIDTH - MARGIN.outer - numWidth;
  const y = MARGIN.bottom / 2;
  
  page.drawText(numText, {
    x,
    y,
    size: 10,
    font,
    color,
  });
};

// Helper: Draw image border
const drawImageBorder = (
  page: any,
  x: number,
  y: number,
  width: number,
  height: number,
  color = COLORS.stone
) => {
  const t = 1;
  page.drawRectangle({ x: x - t, y: y + height, width: width + t * 2, height: t, color });
  page.drawRectangle({ x: x - t, y: y - t, width: width + t * 2, height: t, color });
  page.drawRectangle({ x: x - t, y, width: t, height, color });
  page.drawRectangle({ x: x + width, y, width: t, height, color });
};

// Helper: Word wrap text
const wrapText = (text: string, font: any, fontSize: number, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

// ========== TEMPLATE RENDERERS ==========

interface RenderContext {
  pdfDoc: any;
  fonts: {
    timesRoman: any;
    timesRomanBold: any;
    timesRomanItalic: any;
    helvetica: any;
  };
  authorName: string;
}

// Template 1: Full-Bleed Hero Image
const renderHeroImage = async (
  ctx: RenderContext,
  pageData: any,
  pageNum: number
) => {
  const { pdfDoc, fonts } = ctx;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  
  // Full bleed image (edge to edge)
  const imageUrls = pageData.image_urls?.length > 0 
    ? pageData.image_urls 
    : pageData.image_url ? [pageData.image_url] : [];
  
  if (imageUrls.length > 0) {
    try {
      const res = await fetch(imageUrls[0]);
      if (res.ok) {
        const bytes = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || '';
        
        let img;
        if (contentType.includes('png')) {
          img = await pdfDoc.embedPng(bytes);
        } else {
          img = await pdfDoc.embedJpg(bytes);
        }
        
        if (img) {
          // Cover entire page (full bleed)
          const scale = Math.max(PAGE_WIDTH / img.width, PAGE_HEIGHT / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (PAGE_WIDTH - w) / 2;
          const y = (PAGE_HEIGHT - h) / 2;
          
          page.drawImage(img, { x, y, width: w, height: h });
        }
      }
    } catch (e) {
      console.error('Hero image embed failed:', e);
    }
  }
  
  // Optional caption (bottom left, small neutral sans-serif)
  if (pageData.caption) {
    const captionY = BLEED + 10;
    page.drawText(pageData.caption, {
      x: BLEED + 15,
      y: captionY,
      size: TYPOGRAPHY.caption.size,
      font: fonts.helvetica,
      color: rgb(1, 1, 1), // White text on image
    });
  }
  
  return page;
};

// Template 2: Image + Reflection (default)
const renderImageReflection = async (
  ctx: RenderContext,
  pageData: any,
  pageNum: number
) => {
  const { pdfDoc, fonts, authorName } = ctx;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  
  // Interior background
  page.drawRectangle({
    x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.interiorBg,
  });
  
  let y = PAGE_HEIGHT - MARGIN.top;
  
  // Title (centered, bold)
  if (pageData.title) {
    const titleWidth = fonts.timesRomanBold.widthOfTextAtSize(pageData.title, TYPOGRAPHY.title.size);
    page.drawText(pageData.title, {
      x: (PAGE_WIDTH - titleWidth) / 2,
      y,
      size: TYPOGRAPHY.title.size,
      font: fonts.timesRomanBold,
      color: COLORS.text,
    });
    y -= 30;
  }
  
  // Attribution (italic)
  const attrText = `A memory from ${authorName}`;
  const attrWidth = fonts.timesRomanItalic.widthOfTextAtSize(attrText, TYPOGRAPHY.attribution.size);
  page.drawText(attrText, {
    x: (PAGE_WIDTH - attrWidth) / 2,
    y,
    size: TYPOGRAPHY.attribution.size,
    font: fonts.timesRomanItalic,
    color: COLORS.text,
  });
  y -= 25;
  
  // Ornamental divider
  drawOrnamentalRule(page, y, PAGE_WIDTH / 2, 120, fonts.timesRoman);
  y -= 35;
  
  // Image (max 60% of content area)
  const imageUrls = pageData.image_urls?.length > 0 
    ? pageData.image_urls 
    : pageData.image_url ? [pageData.image_url] : [];
  
  const contentWidth = PAGE_WIDTH - MARGIN.outer - MARGIN.inner;
  const maxImageHeight = (PAGE_HEIGHT - MARGIN.top - MARGIN.bottom) * 0.6;
  
  if (imageUrls.length > 0) {
    try {
      const res = await fetch(imageUrls[0]);
      if (res.ok) {
        const bytes = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || '';
        
        let img;
        if (contentType.includes('png')) {
          img = await pdfDoc.embedPng(bytes);
        } else {
          img = await pdfDoc.embedJpg(bytes);
        }
        
        if (img) {
          const scale = Math.min(contentWidth / img.width, maxImageHeight / img.height, 1);
          const w = img.width * scale;
          const h = img.height * scale;
          const imgX = (PAGE_WIDTH - w) / 2;
          const imgY = y - h;
          
          drawImageBorder(page, imgX, imgY, w, h);
          page.drawImage(img, { x: imgX, y: imgY, width: w, height: h });
          y = imgY - 25;
        }
      }
    } catch (e) {
      console.error('Image embed failed:', e);
    }
  }
  
  // Reflection text (serif, generous line spacing)
  if (pageData.content) {
    const lineHeight = TYPOGRAPHY.body.size * TYPOGRAPHY.body.lineHeight;
    const lines = wrapText(pageData.content, fonts.timesRoman, TYPOGRAPHY.body.size, contentWidth);
    
    for (const line of lines) {
      if (y < MARGIN.bottom + 30) break;
      page.drawText(line, {
        x: MARGIN.inner,
        y,
        size: TYPOGRAPHY.body.size,
        font: fonts.timesRoman,
        color: COLORS.text,
      });
      y -= lineHeight;
    }
  }
  
  // Page number
  drawPageNumber(page, pageNum, pageNum % 2 === 0, fonts.timesRoman);
  
  return page;
};

// Template 3: Long-Form Story Page
const renderStory = async (
  ctx: RenderContext,
  pageData: any,
  pageNum: number
) => {
  const { pdfDoc, fonts, authorName } = ctx;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  
  page.drawRectangle({
    x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.interiorBg,
  });
  
  // Wide margins for readability
  const wideMargin = mmToPoints(30);
  const contentWidth = PAGE_WIDTH - wideMargin * 2;
  let y = PAGE_HEIGHT - MARGIN.top;
  
  // Title
  if (pageData.title) {
    const titleWidth = fonts.timesRomanBold.widthOfTextAtSize(pageData.title, TYPOGRAPHY.title.size);
    page.drawText(pageData.title, {
      x: (PAGE_WIDTH - titleWidth) / 2,
      y,
      size: TYPOGRAPHY.title.size,
      font: fonts.timesRomanBold,
      color: COLORS.text,
    });
    y -= 35;
  }
  
  // Attribution
  const attrText = `A memory from ${authorName}`;
  const attrWidth = fonts.timesRomanItalic.widthOfTextAtSize(attrText, TYPOGRAPHY.attribution.size);
  page.drawText(attrText, {
    x: (PAGE_WIDTH - attrWidth) / 2,
    y,
    size: TYPOGRAPHY.attribution.size,
    font: fonts.timesRomanItalic,
    color: COLORS.text,
  });
  y -= 40;
  
  // Story text with optional drop cap
  if (pageData.content) {
    const content = pageData.content;
    const lineHeight = TYPOGRAPHY.body.size * TYPOGRAPHY.body.lineHeight;
    
    // Drop cap (first letter large)
    const firstLetter = content.charAt(0).toUpperCase();
    const restOfFirstWord = content.substring(1).split(' ')[0];
    const restOfText = content.substring(firstLetter.length + restOfFirstWord.length).trim();
    
    // Draw drop cap
    const dropCapSize = TYPOGRAPHY.dropCap.size;
    const dropCapHeight = dropCapSize * 0.75;
    page.drawText(firstLetter, {
      x: wideMargin,
      y: y - dropCapHeight + 12,
      size: dropCapSize,
      font: fonts.timesRomanBold,
      color: COLORS.text,
    });
    
    const dropCapWidth = fonts.timesRomanBold.widthOfTextAtSize(firstLetter, dropCapSize) + 8;
    
    // First few lines wrap around drop cap
    const dropCapLines = 3;
    const narrowWidth = contentWidth - dropCapWidth;
    
    // First word after drop cap
    page.drawText(restOfFirstWord, {
      x: wideMargin + dropCapWidth,
      y,
      size: TYPOGRAPHY.body.size,
      font: fonts.timesRoman,
      color: COLORS.text,
    });
    
    const firstWordWidth = fonts.timesRoman.widthOfTextAtSize(restOfFirstWord + ' ', TYPOGRAPHY.body.size);
    let remainingText = restOfText;
    let currentX = wideMargin + dropCapWidth + firstWordWidth;
    let linesDrawn = 0;
    
    // Draw text wrapping around drop cap
    const words = remainingText.split(' ');
    let wordIndex = 0;
    
    while (linesDrawn < dropCapLines && wordIndex < words.length) {
      const word = words[wordIndex];
      const wordWidth = fonts.timesRoman.widthOfTextAtSize(word + ' ', TYPOGRAPHY.body.size);
      const maxX = linesDrawn === 0 ? wideMargin + contentWidth : wideMargin + dropCapWidth + narrowWidth;
      
      if (currentX + wordWidth > maxX) {
        y -= lineHeight;
        linesDrawn++;
        currentX = wideMargin + dropCapWidth;
      }
      
      if (linesDrawn < dropCapLines) {
        page.drawText(word + ' ', {
          x: currentX,
          y,
          size: TYPOGRAPHY.body.size,
          font: fonts.timesRoman,
          color: COLORS.text,
        });
        currentX += wordWidth;
        wordIndex++;
      }
    }
    
    y -= lineHeight;
    
    // Remaining text (full width)
    const remainingWords = words.slice(wordIndex).join(' ');
    if (remainingWords) {
      const lines = wrapText(remainingWords, fonts.timesRoman, TYPOGRAPHY.body.size, contentWidth);
      for (const line of lines) {
        if (y < MARGIN.bottom + 30) break;
        page.drawText(line, {
          x: wideMargin,
          y,
          size: TYPOGRAPHY.body.size,
          font: fonts.timesRoman,
          color: COLORS.text,
        });
        y -= lineHeight;
      }
    }
  }
  
  drawPageNumber(page, pageNum, pageNum % 2 === 0, fonts.timesRoman);
  return page;
};

// Template 4: Timeline/Highlights
const renderTimeline = async (
  ctx: RenderContext,
  pageData: any,
  pageNum: number
) => {
  const { pdfDoc, fonts } = ctx;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  
  page.drawRectangle({
    x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.interiorBg,
  });
  
  let y = PAGE_HEIGHT - MARGIN.top;
  const contentX = MARGIN.inner + 20;
  
  // Title (e.g., "Transfers & Companions")
  if (pageData.title) {
    page.drawText(pageData.title.toUpperCase(), {
      x: MARGIN.inner,
      y,
      size: TYPOGRAPHY.heading.size,
      font: fonts.timesRomanBold,
      color: COLORS.text,
    });
    y -= 8;
    
    // Underline
    const titleWidth = fonts.timesRomanBold.widthOfTextAtSize(pageData.title.toUpperCase(), TYPOGRAPHY.heading.size);
    page.drawRectangle({
      x: MARGIN.inner,
      y,
      width: titleWidth,
      height: 1,
      color: COLORS.gold,
    });
    y -= 35;
  }
  
  // Timeline entries
  const entries = pageData.timeline_data || [];
  const entrySpacing = 28;
  
  for (const entry of entries) {
    if (y < MARGIN.bottom + 30) break;
    
    // Date (bold)
    if (entry.date) {
      page.drawText(entry.date, {
        x: MARGIN.inner,
        y,
        size: TYPOGRAPHY.body.size,
        font: fonts.timesRomanBold,
        color: COLORS.text,
      });
    }
    
    // Description with bullet
    if (entry.description) {
      const bulletChar = '·';
      page.drawText(bulletChar, {
        x: contentX - 12,
        y: y - 16,
        size: TYPOGRAPHY.body.size + 4,
        font: fonts.timesRoman,
        color: COLORS.gold,
      });
      
      const lines = wrapText(entry.description, fonts.timesRoman, TYPOGRAPHY.body.size, PAGE_WIDTH - contentX - MARGIN.outer);
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], {
          x: contentX,
          y: y - 16 - (i * 14),
          size: TYPOGRAPHY.body.size,
          font: fonts.timesRoman,
          color: COLORS.text,
        });
      }
      y -= 16 + (lines.length * 14);
    }
    
    y -= entrySpacing - 16;
  }
  
  drawPageNumber(page, pageNum, pageNum % 2 === 0, fonts.timesRoman);
  return page;
};

// ========== MAIN HANDLER ==========

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { vaultId } = await req.json();
    if (!vaultId) {
      return new Response(JSON.stringify({ error: 'Vault ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch vault
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vaultId)
      .single();

    if (vaultError || !vault) {
      return new Response(JSON.stringify({ error: 'Vault not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Authorization check
    const isOwner = vault.owner_id === user.id;
    if (!isOwner) {
      const { data: contributor } = await supabase
        .from('vault_contributors')
        .select('id')
        .eq('vault_id', vaultId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!contributor) {
        return new Response(JSON.stringify({ error: 'Access denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fetch approved pages
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('vault_id', vaultId)
      .eq('status', 'approved')
      .order('page_order', { ascending: true });

    if (pagesError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch pages' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch contributor profiles
    const contributorIds = [...new Set(pages?.map(p => p.contributor_id) || [])];
    let profilesMap: Record<string, string> = {};
    
    if (contributorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', contributorIds);
      
      if (profiles) {
        profiles.forEach(p => {
          profilesMap[p.user_id] = p.full_name || p.email || 'Anonymous';
        });
      }
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    
    // Set PDF metadata
    pdfDoc.setTitle(`${vault.recipient_name} - Mission Memory Vault`);
    pdfDoc.setAuthor('Mission Memory Vault');
    pdfDoc.setSubject(vault.mission_name || 'Mission Memory Book');
    pdfDoc.setCreator('Mission Memory Vault');
    pdfDoc.setCreationDate(new Date());
    
    const fonts = {
      timesRoman: await pdfDoc.embedFont(StandardFonts.TimesRoman),
      timesRomanBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
      timesRomanItalic: await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
      helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
    };

    // Cover colors by vault type
    const getCoverColors = (vaultType: string) => {
      switch (vaultType) {
        case 'farewell':
          return { bg: rgb(0.957, 0.945, 0.925), text: rgb(0.169, 0.169, 0.165) };
        case 'homecoming':
          return { bg: rgb(0.184, 0.243, 0.212), text: rgb(0.957, 0.945, 0.925) };
        case 'returned':
          return { bg: rgb(0.169, 0.169, 0.165), text: rgb(0.957, 0.945, 0.925) };
        default:
          return { bg: rgb(0.957, 0.945, 0.925), text: rgb(0.169, 0.169, 0.165) };
      }
    };

    const coverColors = getCoverColors(vault.vault_type || 'farewell');

    // Load cover background image
    const getCoverStorageUrls = (vaultType: string) => {
      const baseName = vaultType === 'homecoming'
        ? 'homecoming-cover-bg'
        : vaultType === 'returned'
          ? 'returned-cover-bg'
          : 'farewell-cover-bg';
      return [
        `${supabaseUrl}/storage/v1/object/public/cover-images/${baseName}.jpg`,
        `${supabaseUrl}/storage/v1/object/public/cover-images/${baseName}.png`,
      ];
    };

    let coverImage: any = null;
    const coverUrls = getCoverStorageUrls(vault.vault_type || 'farewell');
    for (const url of coverUrls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const bytes = new Uint8Array(await res.arrayBuffer());
        const ct = res.headers.get('content-type') || '';
        coverImage = ct.includes('png') 
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes);
        break;
      } catch (e) {
        console.error('Cover load failed:', url);
      }
    }

    const drawCoverBackground = (page: any) => {
      page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: coverColors.bg });
      if (coverImage) {
        const scale = Math.max(PAGE_WIDTH / coverImage.width, PAGE_HEIGHT / coverImage.height);
        const w = coverImage.width * scale;
        const h = coverImage.height * scale;
        page.drawImage(coverImage, { x: (PAGE_WIDTH - w) / 2, y: (PAGE_HEIGHT - h) / 2, width: w, height: h });
      }
    };

    // ========== FRONT COVER ==========
    const coverPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawCoverBackground(coverPage);
    
    const titleText = 'Mission Memory Vault';
    const coverCenterY = PAGE_HEIGHT / 2;
    
    drawOrnamentalRule(coverPage, coverCenterY + 50, PAGE_WIDTH / 2, 200, fonts.timesRoman, coverColors.text);
    
    // Title with letter spacing
    const coverTitleSize = 56;
    const letterSpacing = 4;
    let titleX = (PAGE_WIDTH - fonts.timesRomanBold.widthOfTextAtSize(titleText, coverTitleSize) - (titleText.length - 1) * letterSpacing) / 2;
    for (const char of titleText) {
      const charWidth = fonts.timesRomanBold.widthOfTextAtSize(char, coverTitleSize);
      coverPage.drawText(char, { x: titleX, y: coverCenterY, size: coverTitleSize, font: fonts.timesRomanBold, color: coverColors.text });
      titleX += charWidth + letterSpacing;
    }
    
    drawOrnamentalRule(coverPage, coverCenterY - 50, PAGE_WIDTH / 2, 200, fonts.timesRoman, coverColors.text);

    // ========== TITLE PAGE ==========
    const titlePage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    titlePage.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.interiorBg });
    
    const titleCenterY = PAGE_HEIGHT / 2 + 40;
    
    drawDecorativeStar(titlePage, PAGE_WIDTH / 2, titleCenterY + 140, fonts.timesRoman);
    titlePage.drawRectangle({ x: PAGE_WIDTH / 2 - 100, y: titleCenterY + 100, width: 200, height: 0.75, color: COLORS.gold });
    
    const recipientSize = 42;
    const recipientWidth = fonts.timesRomanBold.widthOfTextAtSize(vault.recipient_name, recipientSize);
    titlePage.drawText(vault.recipient_name, {
      x: (PAGE_WIDTH - recipientWidth) / 2,
      y: titleCenterY + 40,
      size: recipientSize,
      font: fonts.timesRomanBold,
      color: COLORS.text,
    });
    
    if (vault.mission_name) {
      const missionSize = 26;
      const missionWidth = fonts.timesRomanItalic.widthOfTextAtSize(vault.mission_name, missionSize);
      titlePage.drawText(vault.mission_name, {
        x: (PAGE_WIDTH - missionWidth) / 2,
        y: titleCenterY - 10,
        size: missionSize,
        font: fonts.timesRomanItalic,
        color: COLORS.text,
      });
    }
    
    if (vault.service_start_date || vault.service_end_date) {
      const formatDate = (d: string | null) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      };
      const datesText = `${formatDate(vault.service_start_date)} — ${formatDate(vault.service_end_date)}`;
      const datesSize = 21;
      const datesWidth = fonts.timesRoman.widthOfTextAtSize(datesText, datesSize);
      titlePage.drawText(datesText, {
        x: (PAGE_WIDTH - datesWidth) / 2,
        y: titleCenterY - 50,
        size: datesSize,
        font: fonts.timesRoman,
        color: COLORS.text,
      });
    }
    
    titlePage.drawRectangle({ x: PAGE_WIDTH / 2 - 100, y: titleCenterY - 90, width: 200, height: 0.75, color: COLORS.gold });
    drawDecorativeStar(titlePage, PAGE_WIDTH / 2, titleCenterY - 130, fonts.timesRoman);

    // ========== CONTENT PAGES ==========
    let contentPageNum = 1;
    
    for (const pageData of pages || []) {
      const template = pageData.page_template || 'image_reflection';
      const authorName = profilesMap[pageData.contributor_id] || 'Anonymous';
      
      const ctx: RenderContext = { pdfDoc, fonts, authorName };
      
      switch (template) {
        case 'hero_image':
          await renderHeroImage(ctx, pageData, contentPageNum);
          break;
        case 'story':
          await renderStory(ctx, pageData, contentPageNum);
          break;
        case 'timeline':
          await renderTimeline(ctx, pageData, contentPageNum);
          break;
        default:
          await renderImageReflection(ctx, pageData, contentPageNum);
      }
      
      contentPageNum++;
    }

    // ========== CLOSING PAGE ==========
    const closingPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    closingPage.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.interiorBg });
    
    const closingCenterY = PAGE_HEIGHT / 2 + 60;
    
    drawDecorativeStar(closingPage, PAGE_WIDTH / 2, closingCenterY + 80, fonts.timesRoman);
    drawOrnamentalRule(closingPage, closingCenterY + 40, PAGE_WIDTH / 2, 180, fonts.timesRoman);
    
    const closingMsg = 'The voices, moments, and messages that shape a life-changing journey have been recorded and will now last forever';
    const closingSize = 24;
    const closingMaxWidth = PAGE_WIDTH - MARGIN.outer * 3;
    const closingLines = wrapText(closingMsg, fonts.timesRomanItalic, closingSize, closingMaxWidth);
    let closingY = closingCenterY - 20;
    const closingLineHeight = 36;
    
    for (const line of closingLines) {
      const lineWidth = fonts.timesRomanItalic.widthOfTextAtSize(line, closingSize);
      closingPage.drawText(line, {
        x: (PAGE_WIDTH - lineWidth) / 2,
        y: closingY,
        size: closingSize,
        font: fonts.timesRomanItalic,
        color: COLORS.text,
      });
      closingY -= closingLineHeight;
    }
    
    drawOrnamentalRule(closingPage, closingY - 20, PAGE_WIDTH / 2, 180, fonts.timesRoman);
    drawDecorativeStar(closingPage, PAGE_WIDTH / 2, closingY - 60, fonts.timesRoman);

    // ========== BACK COVER ==========
    const backCover = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawCoverBackground(backCover);

    // Ensure even page count
    if (pdfDoc.getPageCount() % 2 !== 0) {
      const paddingPage = pdfDoc.insertPage(pdfDoc.getPageCount() - 1, [PAGE_WIDTH, PAGE_HEIGHT]);
      paddingPage.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.interiorBg });
    }

    // Generate PDF
    const pdfBytes = await pdfDoc.save();
    const filename = `${vault.title.replace(/[^a-zA-Z0-9]/g, '-')}-memory-book.pdf`;

    return new Response(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
