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
const MARGIN = mmToPoints(10); // 10mm safety margin (~28.35 points)

// Gold accent color for decorative elements (#B8A66A)
const GOLD_COLOR = rgb(0.722, 0.651, 0.416);
// Warm stone color for subtle borders (#D4C8B8)
const STONE_COLOR = rgb(0.831, 0.784, 0.722);

// Interior page colors
const INTERIOR_BG = rgb(0.957, 0.945, 0.925); // #F4F1EC bone parchment
const INTERIOR_TEXT = rgb(0.169, 0.169, 0.165); // #2B2B2A deep charcoal

// Helper function to draw ornamental rule with diamond center
const drawOrnamentalRule = (
  page: any,
  y: number,
  centerX: number,
  width: number,
  font: any,
  color = GOLD_COLOR
) => {
  const halfWidth = width / 2;
  const lineThickness = 0.75;
  const diamondGap = 12;
  
  // Left line
  page.drawRectangle({
    x: centerX - halfWidth,
    y: y - lineThickness / 2,
    width: halfWidth - diamondGap,
    height: lineThickness,
    color,
  });
  
  // Right line
  page.drawRectangle({
    x: centerX + diamondGap,
    y: y - lineThickness / 2,
    width: halfWidth - diamondGap,
    height: lineThickness,
    color,
  });
  
  // Diamond in center (using special character ◆)
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

// Helper function to draw decorative star
const drawDecorativeStar = (
  page: any,
  x: number,
  y: number,
  font: any,
  color = GOLD_COLOR
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

// Helper function to draw page number
const drawPageNumber = (
  page: any,
  pageNum: number,
  isLeftPage: boolean,
  font: any,
  color = INTERIOR_TEXT
) => {
  const numText = String(pageNum);
  const numWidth = font.widthOfTextAtSize(numText, 10);
  const x = isLeftPage ? MARGIN : PAGE_WIDTH - MARGIN - numWidth;
  const y = MARGIN / 2;
  
  page.drawText(numText, {
    x,
    y,
    size: 10,
    font,
    color,
  });
};

// Helper function to draw subtle image border
const drawImageBorder = (
  page: any,
  x: number,
  y: number,
  width: number,
  height: number,
  color = STONE_COLOR
) => {
  const borderThickness = 1;
  
  // Top border
  page.drawRectangle({
    x: x - borderThickness,
    y: y + height,
    width: width + borderThickness * 2,
    height: borderThickness,
    color,
  });
  
  // Bottom border
  page.drawRectangle({
    x: x - borderThickness,
    y: y - borderThickness,
    width: width + borderThickness * 2,
    height: borderThickness,
    color,
  });
  
  // Left border
  page.drawRectangle({
    x: x - borderThickness,
    y: y,
    width: borderThickness,
    height: height,
    color,
  });
  
  // Right border
  page.drawRectangle({
    x: x + width,
    y: y,
    width: borderThickness,
    height: height,
    color,
  });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user
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

    // Fetch vault details
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

    // Authorization check: verify user is owner or contributor
    const isOwner = vault.owner_id === user.id;
    
    if (!isOwner) {
      const { data: contributor } = await supabase
        .from('vault_contributors')
        .select('id')
        .eq('vault_id', vaultId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!contributor) {
        return new Response(JSON.stringify({ error: 'You do not have access to this vault' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fetch approved pages with contributor profiles for attribution
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

    // Fetch contributor profiles for attribution
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

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const symbol = await pdfDoc.embedFont(StandardFonts.Symbol);

    // Font sizes (scaled for 12x12)
    const scaleFactor = PAGE_WIDTH / 648; // Scale based on 9x9 base
    const coverTitleSize = Math.round(42 * scaleFactor);
    const recipientSize = Math.round(32 * scaleFactor);
    const missionSize = Math.round(20 * scaleFactor);
    const datesSize = Math.round(16 * scaleFactor);
    const contentTitleSize = Math.round(26 * scaleFactor);
    const attributionSize = Math.round(14 * scaleFactor);
    const contentBodySize = Math.round(15 * scaleFactor);
    const closingSize = Math.round(18 * scaleFactor);
    const pageNumSize = 11;

    // Get cover colors based on vault type
    const getCoverColors = (vaultType: string) => {
      switch (vaultType) {
        case 'farewell':
          return {
            bg: rgb(0.957, 0.945, 0.925), // #F4F1EC
            text: rgb(0.169, 0.169, 0.165), // #2B2B2A
          };
        case 'homecoming':
          return {
            bg: rgb(0.184, 0.243, 0.212), // #2F3E36
            text: rgb(0.957, 0.945, 0.925), // #F4F1EC
          };
        case 'returned':
          return {
            bg: rgb(0.169, 0.169, 0.165), // #2B2B2A
            text: rgb(0.957, 0.945, 0.925), // #F4F1EC
          };
        default:
          return {
            bg: rgb(0.957, 0.945, 0.925),
            text: rgb(0.169, 0.169, 0.165),
          };
      }
    };

    const coverColors = getCoverColors(vault.vault_type || 'farewell');

    // Cover background image handling
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

    const coverImageUrls = getCoverStorageUrls(vault.vault_type || 'farewell');
    let cachedCoverImage: any | null = null;

    const loadCoverImage = async () => {
      if (cachedCoverImage) return cachedCoverImage;

      for (const url of coverImageUrls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;

          const bytes = new Uint8Array(await res.arrayBuffer());
          const contentType = res.headers.get('content-type') || '';

          if (contentType.includes('png')) {
            cachedCoverImage = await pdfDoc.embedPng(bytes);
          } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            cachedCoverImage = await pdfDoc.embedJpg(bytes);
          } else {
            try {
              cachedCoverImage = await pdfDoc.embedPng(bytes);
            } catch {
              cachedCoverImage = await pdfDoc.embedJpg(bytes);
            }
          }

          return cachedCoverImage;
        } catch (e) {
          console.error('Cover load failed:', url, e);
        }
      }

      return null;
    };

    const drawCoverBackground = async (page: any) => {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        color: coverColors.bg,
      });

      try {
        const img = await loadCoverImage();
        if (!img) return;

        const scale = Math.max(PAGE_WIDTH / img.width, PAGE_HEIGHT / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const x = (PAGE_WIDTH - drawW) / 2;
        const y = (PAGE_HEIGHT - drawH) / 2;

        page.drawImage(img, { x, y, width: drawW, height: drawH });
      } catch (e) {
        console.error('Cover embed failed:', e);
      }
    };

    // ========== FRONT COVER ==========
    const coverPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    await drawCoverBackground(coverPage);

    const titleText = 'Mission Memory Vault';
    const titleWidth = timesRomanBold.widthOfTextAtSize(titleText, coverTitleSize);
    const coverCenterY = PAGE_HEIGHT / 2;
    
    // Ornamental rule above title
    drawOrnamentalRule(coverPage, coverCenterY + 50, PAGE_WIDTH / 2, 200, timesRoman, coverColors.text);
    
    // Title with letter-spacing simulation (draw each letter separately)
    const letterSpacing = 4;
    let titleX = (PAGE_WIDTH - titleWidth - (titleText.length - 1) * letterSpacing) / 2;
    for (const char of titleText) {
      const charWidth = timesRomanBold.widthOfTextAtSize(char, coverTitleSize);
      coverPage.drawText(char, {
        x: titleX,
        y: coverCenterY,
        size: coverTitleSize,
        font: timesRomanBold,
        color: coverColors.text,
      });
      titleX += charWidth + letterSpacing;
    }
    
    // Ornamental rule below title
    drawOrnamentalRule(coverPage, coverCenterY - 50, PAGE_WIDTH / 2, 200, timesRoman, coverColors.text);

    // ========== TITLE PAGE (DEDICATION) ==========
    const titlePage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    titlePage.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: INTERIOR_BG,
    });

    const titleCenterY = PAGE_HEIGHT / 2 + 40;
    
    // Decorative star at top
    drawDecorativeStar(titlePage, PAGE_WIDTH / 2, titleCenterY + 140, timesRoman);
    
    // Thin gold rule above recipient name
    titlePage.drawRectangle({
      x: PAGE_WIDTH / 2 - 100,
      y: titleCenterY + 100,
      width: 200,
      height: 0.75,
      color: GOLD_COLOR,
    });

    // Recipient name (larger, bold)
    const recipientWidth = timesRomanBold.widthOfTextAtSize(vault.recipient_name, recipientSize);
    titlePage.drawText(vault.recipient_name, {
      x: (PAGE_WIDTH - recipientWidth) / 2,
      y: titleCenterY + 40,
      size: recipientSize,
      font: timesRomanBold,
      color: INTERIOR_TEXT,
    });

    // Mission name (italic)
    if (vault.mission_name) {
      const missionWidth = timesRomanItalic.widthOfTextAtSize(vault.mission_name, missionSize);
      titlePage.drawText(vault.mission_name, {
        x: (PAGE_WIDTH - missionWidth) / 2,
        y: titleCenterY - 10,
        size: missionSize,
        font: timesRomanItalic,
        color: INTERIOR_TEXT,
      });
    }

    // Service dates with em-dash
    if (vault.service_start_date || vault.service_end_date) {
      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      };
      const datesText = `${formatDate(vault.service_start_date)} — ${formatDate(vault.service_end_date)}`;
      const datesWidth = timesRoman.widthOfTextAtSize(datesText, datesSize);
      titlePage.drawText(datesText, {
        x: (PAGE_WIDTH - datesWidth) / 2,
        y: titleCenterY - 50,
        size: datesSize,
        font: timesRoman,
        color: INTERIOR_TEXT,
      });
    }

    // Thin gold rule below dates
    titlePage.drawRectangle({
      x: PAGE_WIDTH / 2 - 100,
      y: titleCenterY - 90,
      width: 200,
      height: 0.75,
      color: GOLD_COLOR,
    });
    
    // Decorative star at bottom
    drawDecorativeStar(titlePage, PAGE_WIDTH / 2, titleCenterY - 130, timesRoman);

    // ========== CONTENT PAGES ==========
    let contentPageNumber = 1; // Start numbering from first content page
    
    for (let i = 0; i < (pages?.length || 0); i++) {
      const pageData = pages![i];
      const contentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      
      // Draw interior background
      contentPage.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        color: INTERIOR_BG,
      });
      
      let yPosition = PAGE_HEIGHT - MARGIN - 20;

      // Title - centered, bold
      if (pageData.title) {
        const pageTitleWidth = timesRomanBold.widthOfTextAtSize(pageData.title, contentTitleSize);
        contentPage.drawText(pageData.title, {
          x: (PAGE_WIDTH - pageTitleWidth) / 2,
          y: yPosition,
          size: contentTitleSize,
          font: timesRomanBold,
          color: INTERIOR_TEXT,
        });
        yPosition -= 30;
      }

      // Contributor attribution (italic)
      const authorName = profilesMap[pageData.contributor_id] || 'Anonymous';
      const attributionText = `A memory from ${authorName}`;
      const attributionWidth = timesRomanItalic.widthOfTextAtSize(attributionText, attributionSize);
      contentPage.drawText(attributionText, {
        x: (PAGE_WIDTH - attributionWidth) / 2,
        y: yPosition,
        size: attributionSize,
        font: timesRomanItalic,
        color: INTERIOR_TEXT,
      });
      yPosition -= 25;

      // Small decorative divider
      drawOrnamentalRule(contentPage, yPosition, PAGE_WIDTH / 2, 120, timesRoman);
      yPosition -= 35;

      // Embed images with borders
      const imageUrls = pageData.image_urls?.length > 0 
        ? pageData.image_urls 
        : pageData.image_url 
          ? [pageData.image_url] 
          : [];
      
      if (imageUrls.length > 0) {
        const maxTotalWidth = PAGE_WIDTH - (MARGIN * 2);
        const maxHeightPerImage = (imageUrls.length === 1 ? 320 : 220) * scaleFactor;
        const gapBetweenImages = 12 * scaleFactor;
        
        let currentX = MARGIN;
        const availableWidthPerImage = imageUrls.length === 1 
          ? maxTotalWidth 
          : (maxTotalWidth - (gapBetweenImages * (imageUrls.length - 1))) / imageUrls.length;

        let maxImageHeight = 0;

        for (const imageUrl of imageUrls) {
          try {
            const imageResponse = await fetch(imageUrl);
            if (imageResponse.ok) {
              const imageBytes = await imageResponse.arrayBuffer();
              const contentType = imageResponse.headers.get('content-type') || '';
              
              let image;
              if (contentType.includes('png')) {
                image = await pdfDoc.embedPng(imageBytes);
              } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
                image = await pdfDoc.embedJpg(imageBytes);
              }
              
              if (image) {
                const scale = Math.min(availableWidthPerImage / image.width, maxHeightPerImage / image.height, 1);
                const scaledWidth = image.width * scale;
                const scaledHeight = image.height * scale;
                
                maxImageHeight = Math.max(maxImageHeight, scaledHeight);
                
                const imageY = yPosition - scaledHeight;
                
                // Draw subtle border around image
                drawImageBorder(contentPage, currentX, imageY, scaledWidth, scaledHeight);
                
                contentPage.drawImage(image, {
                  x: currentX,
                  y: imageY,
                  width: scaledWidth,
                  height: scaledHeight,
                });
                
                currentX += scaledWidth + gapBetweenImages;
              }
            }
          } catch (imgError) {
            console.error('Failed to embed image:', imgError);
          }
        }
        
        yPosition -= maxImageHeight + 25;
      }

      // Content text with word wrapping and improved line height
      if (pageData.content) {
        const words = pageData.content.split(' ');
        let currentLine = '';
        const maxLineWidth = PAGE_WIDTH - (MARGIN * 2);
        const lineHeight = 22 * scaleFactor; // Slightly increased line height

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = timesRoman.widthOfTextAtSize(testLine, contentBodySize);
          
          if (testWidth > maxLineWidth && currentLine) {
            contentPage.drawText(currentLine, {
              x: MARGIN,
              y: yPosition,
              size: contentBodySize,
              font: timesRoman,
              color: INTERIOR_TEXT,
            });
            yPosition -= lineHeight;
            currentLine = word;
            
            if (yPosition < MARGIN + 30) {
              break;
            }
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine && yPosition >= MARGIN + 30) {
          contentPage.drawText(currentLine, {
            x: MARGIN,
            y: yPosition,
            size: contentBodySize,
            font: timesRoman,
            color: INTERIOR_TEXT,
          });
        }
      }

      // Page number in outer margin (odd pages right, even pages left)
      const isLeftPage = contentPageNumber % 2 === 0;
      drawPageNumber(contentPage, contentPageNumber, isLeftPage, timesRoman);
      contentPageNumber++;
    }

    // ========== CLOSING PAGE ==========
    const closingPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    closingPage.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: INTERIOR_BG,
    });
    
    const closingCenterY = PAGE_HEIGHT / 2 + 60;
    
    // Decorative star at top
    drawDecorativeStar(closingPage, PAGE_WIDTH / 2, closingCenterY + 80, timesRoman);
    
    // Ornamental rule above message
    drawOrnamentalRule(closingPage, closingCenterY + 40, PAGE_WIDTH / 2, 180, timesRoman);

    // Closing message in italic, word-wrapped and centered
    const closingMessage = 'The voices, moments, and messages that shape a life-changing journey have been recorded and will now last forever';
    const closingMaxWidth = PAGE_WIDTH - (MARGIN * 3);
    const closingWords = closingMessage.split(' ');
    let closingLine = '';
    let closingY = closingCenterY - 20;
    const closingLineHeight = 28;
    
    for (const word of closingWords) {
      const testLine = closingLine ? `${closingLine} ${word}` : word;
      const testWidth = timesRomanItalic.widthOfTextAtSize(testLine, closingSize);
      
      if (testWidth > closingMaxWidth && closingLine) {
        const lineWidth = timesRomanItalic.widthOfTextAtSize(closingLine, closingSize);
        closingPage.drawText(closingLine, {
          x: (PAGE_WIDTH - lineWidth) / 2,
          y: closingY,
          size: closingSize,
          font: timesRomanItalic,
          color: INTERIOR_TEXT,
        });
        closingY -= closingLineHeight;
        closingLine = word;
      } else {
        closingLine = testLine;
      }
    }
    
    if (closingLine) {
      const lineWidth = timesRomanItalic.widthOfTextAtSize(closingLine, closingSize);
      closingPage.drawText(closingLine, {
        x: (PAGE_WIDTH - lineWidth) / 2,
        y: closingY,
        size: closingSize,
        font: timesRomanItalic,
        color: INTERIOR_TEXT,
      });
    }
    
    // Ornamental rule below message
    drawOrnamentalRule(closingPage, closingY - 50, PAGE_WIDTH / 2, 180, timesRoman);
    
    // Decorative star at bottom
    drawDecorativeStar(closingPage, PAGE_WIDTH / 2, closingY - 90, timesRoman);

    // ========== BACK COVER ==========
    const backCover = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    await drawCoverBackground(backCover);

    // Ensure even page count by adding padding page before back cover if needed
    const totalPages = pdfDoc.getPageCount();
    if (totalPages % 2 !== 0) {
      const backCoverIndex = pdfDoc.getPageCount() - 1;
      const paddingPage = pdfDoc.insertPage(backCoverIndex, [PAGE_WIDTH, PAGE_HEIGHT]);
      paddingPage.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        color: INTERIOR_BG,
      });
    }

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBody = new Uint8Array(pdfBytes);

    const filename = `${vault.title.replace(/[^a-zA-Z0-9]/g, '-')}-memory-book.pdf`;

    return new Response(pdfBody, {
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
