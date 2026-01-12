import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Fetch pages
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('vault_id', vaultId)
      .order('page_order', { ascending: true });

    if (pagesError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch pages' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create PDF document (8.5 x 11 inches at 72 DPI for preview, scaled for 300 DPI print)
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    // Page dimensions (letter size)
    const pageWidth = 612; // 8.5 inches * 72
    const pageHeight = 792; // 11 inches * 72
    const margin = 72; // 1 inch margins

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

    // Create cover page
    const coverPage = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Draw cover background
    coverPage.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: coverColors.bg,
    });

    // Cover title - just "Mission Memory Vault" centered
    const titleText = 'Mission Memory Vault';
    const titleFontSize = 36;
    const titleWidth = timesRomanBold.widthOfTextAtSize(titleText, titleFontSize);
    coverPage.drawText(titleText, {
      x: (pageWidth - titleWidth) / 2,
      y: pageHeight / 2,
      size: titleFontSize,
      font: timesRomanBold,
      color: coverColors.text,
    });

    // Interior page colors - consistent across all vaults
    const interiorBg = rgb(0.957, 0.945, 0.925); // #F4F1EC bone parchment
    const interiorText = rgb(0.169, 0.169, 0.165); // #2B2B2A deep charcoal

    // Add title page (dedication page)
    const titlePage = pdfDoc.addPage([pageWidth, pageHeight]);
    titlePage.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: interiorBg,
    });

    // Recipient name
    const recipientFontSize = 28;
    const recipientWidth = timesRomanBold.widthOfTextAtSize(vault.recipient_name, recipientFontSize);
    titlePage.drawText(vault.recipient_name, {
      x: (pageWidth - recipientWidth) / 2,
      y: pageHeight / 2 + 60,
      size: recipientFontSize,
      font: timesRomanBold,
      color: interiorText,
    });

    // Mission name
    if (vault.mission_name) {
      const missionFontSize = 18;
      const missionWidth = timesRoman.widthOfTextAtSize(vault.mission_name, missionFontSize);
      titlePage.drawText(vault.mission_name, {
        x: (pageWidth - missionWidth) / 2,
        y: pageHeight / 2 + 20,
        size: missionFontSize,
        font: timesRoman,
        color: interiorText,
      });
    }

    // Service dates
    if (vault.service_start_date || vault.service_end_date) {
      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      };
      const datesText = `${formatDate(vault.service_start_date)} — ${formatDate(vault.service_end_date)}`;
      const datesFontSize = 14;
      const datesWidth = timesRoman.widthOfTextAtSize(datesText, datesFontSize);
      titlePage.drawText(datesText, {
        x: (pageWidth - datesWidth) / 2,
        y: pageHeight / 2 - 20,
        size: datesFontSize,
        font: timesRoman,
        color: interiorText,
      });
    }

    // Add content pages
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const contentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      
      // Draw background
      contentPage.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: interiorBg,
      });
      
      let yPosition = pageHeight - margin;

      // Title - centered, no page numbers
      if (page.title) {
        const titleWidth = timesRomanBold.widthOfTextAtSize(page.title, 24);
        contentPage.drawText(page.title, {
          x: (pageWidth - titleWidth) / 2,
          y: yPosition,
          size: 24,
          font: timesRomanBold,
          color: interiorText,
        });
        yPosition -= 40;
      }

      // Embed images (support multiple images)
      const imageUrls = page.image_urls?.length > 0 
        ? page.image_urls 
        : page.image_url 
          ? [page.image_url] 
          : [];
      
      if (imageUrls.length > 0) {
        // Calculate layout based on number of images
        const maxTotalWidth = pageWidth - (margin * 2);
        const maxHeightPerImage = imageUrls.length === 1 ? 300 : 200;
        const gapBetweenImages = 10;
        
        // For multiple images, arrange them side by side
        let currentX = margin;
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
                
                contentPage.drawImage(image, {
                  x: currentX,
                  y: yPosition - scaledHeight,
                  width: scaledWidth,
                  height: scaledHeight,
                });
                
                currentX += scaledWidth + gapBetweenImages;
              }
            }
          } catch (imgError) {
            console.error('Failed to embed image:', imgError);
            // Continue without the image
          }
        }
        
        yPosition -= maxImageHeight + 20;
      }

      // Content text with word wrapping - using serif font for body
      if (page.content) {
        const words = page.content.split(' ');
        let currentLine = '';
        const maxLineWidth = pageWidth - (margin * 2);
        const lineHeight = 20;
        const fontSize = 14;

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = timesRoman.widthOfTextAtSize(testLine, fontSize);
          
          if (testWidth > maxLineWidth && currentLine) {
            contentPage.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: timesRoman,
              color: interiorText,
            });
            yPosition -= lineHeight;
            currentLine = word;
            
            // Check if we need a new page
            if (yPosition < margin) {
              break;
            }
          } else {
            currentLine = testLine;
          }
        }
        
        // Draw remaining text
        if (currentLine && yPosition >= margin) {
          contentPage.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: timesRoman,
            color: interiorText,
          });
        }
      }
    }

    // Add closing message page
    const closingPage = pdfDoc.addPage([pageWidth, pageHeight]);
    closingPage.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: interiorBg,
    });
    
    const closingMessage = 'The voices, moments, and messages that shape a life-changing journey have been recorded and will now last forever.';
    const closingFontSize = 16;
    const closingMaxWidth = pageWidth - (margin * 2);
    const closingWords = closingMessage.split(' ');
    let closingLine = '';
    let closingY = pageHeight / 2 + 20;
    
    for (const word of closingWords) {
      const testLine = closingLine ? `${closingLine} ${word}` : word;
      const testWidth = timesRoman.widthOfTextAtSize(testLine, closingFontSize);
      
      if (testWidth > closingMaxWidth && closingLine) {
        const lineWidth = timesRoman.widthOfTextAtSize(closingLine, closingFontSize);
        closingPage.drawText(closingLine, {
          x: (pageWidth - lineWidth) / 2,
          y: closingY,
          size: closingFontSize,
          font: timesRoman,
          color: interiorText,
        });
        closingY -= 24;
        closingLine = word;
      } else {
        closingLine = testLine;
      }
    }
    
    if (closingLine) {
      const lineWidth = timesRoman.widthOfTextAtSize(closingLine, closingFontSize);
      closingPage.drawText(closingLine, {
        x: (pageWidth - lineWidth) / 2,
        y: closingY,
        size: closingFontSize,
        font: timesRoman,
        color: interiorText,
      });
    }

    // Add back cover
    const backCover = pdfDoc.addPage([pageWidth, pageHeight]);
    backCover.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: coverColors.bg,
    });

    const madeWithText = 'Made with Mission Memory Vault™';
    const madeWithWidth = timesRoman.widthOfTextAtSize(madeWithText, 12);
    backCover.drawText(madeWithText, {
      x: (pageWidth - madeWithWidth) / 2,
      y: margin,
      size: 12,
      font: timesRoman,
      color: coverColors.text,
    });

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convert to base64 in chunks to avoid stack overflow
    const uint8Array = new Uint8Array(pdfBytes);
    let binaryString = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binaryString += String.fromCharCode(...chunk);
    }
    const base64Pdf = btoa(binaryString);

    return new Response(JSON.stringify({ 
      pdf: base64Pdf,
      filename: `${vault.title.replace(/[^a-zA-Z0-9]/g, '-')}-memory-book.pdf`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
