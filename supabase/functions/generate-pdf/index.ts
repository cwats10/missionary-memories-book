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

    // Create cover page
    const coverPage = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Draw cover background
    coverPage.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(0.95, 0.93, 0.88), // Warm cream color
    });

    // Cover title
    const titleFontSize = 36;
    const titleWidth = timesRomanBold.widthOfTextAtSize(vault.title, titleFontSize);
    coverPage.drawText(vault.title, {
      x: (pageWidth - titleWidth) / 2,
      y: pageHeight / 2 + 60,
      size: titleFontSize,
      font: timesRomanBold,
      color: rgb(0.2, 0.15, 0.1),
    });

    // Subtitle - recipient name
    const subtitleText = `For ${vault.recipient_name}`;
    const subtitleFontSize = 18;
    const subtitleWidth = timesRoman.widthOfTextAtSize(subtitleText, subtitleFontSize);
    coverPage.drawText(subtitleText, {
      x: (pageWidth - subtitleWidth) / 2,
      y: pageHeight / 2,
      size: subtitleFontSize,
      font: timesRoman,
      color: rgb(0.4, 0.35, 0.3),
    });

    // Occasion if present
    if (vault.occasion) {
      const occasionWidth = timesRoman.widthOfTextAtSize(vault.occasion, 14);
      coverPage.drawText(vault.occasion, {
        x: (pageWidth - occasionWidth) / 2,
        y: pageHeight / 2 - 40,
        size: 14,
        font: timesRoman,
        color: rgb(0.5, 0.45, 0.4),
      });
    }

    // Add content pages
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const contentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      
      let yPosition = pageHeight - margin;

      // Page number
      const pageNum = `Page ${i + 1}`;
      const pageNumWidth = timesRoman.widthOfTextAtSize(pageNum, 10);
      contentPage.drawText(pageNum, {
        x: pageWidth - margin - pageNumWidth,
        y: margin / 2,
        size: 10,
        font: timesRoman,
        color: rgb(0.6, 0.6, 0.6),
      });

      // Title
      if (page.title) {
        contentPage.drawText(page.title, {
          x: margin,
          y: yPosition,
          size: 24,
          font: timesRomanBold,
          color: rgb(0.2, 0.15, 0.1),
        });
        yPosition -= 40;
      }

      // Image placeholder note (actual image embedding would require fetching and embedding)
      if (page.image_url) {
        try {
          // Fetch the image
          const imageResponse = await fetch(page.image_url);
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
              const maxWidth = pageWidth - (margin * 2);
              const maxHeight = 300;
              const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
              const scaledWidth = image.width * scale;
              const scaledHeight = image.height * scale;
              
              contentPage.drawImage(image, {
                x: margin,
                y: yPosition - scaledHeight,
                width: scaledWidth,
                height: scaledHeight,
              });
              yPosition -= scaledHeight + 20;
            }
          }
        } catch (imgError) {
          console.error('Failed to embed image:', imgError);
          // Continue without the image
        }
      }

      // Content text with word wrapping
      if (page.content) {
        const words = page.content.split(' ');
        let currentLine = '';
        const maxLineWidth = pageWidth - (margin * 2);
        const lineHeight = 18;
        const fontSize = 12;

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = timesRoman.widthOfTextAtSize(testLine, fontSize);
          
          if (testWidth > maxLineWidth && currentLine) {
            contentPage.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: timesRoman,
              color: rgb(0.2, 0.2, 0.2),
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
            color: rgb(0.2, 0.2, 0.2),
          });
        }
      }
    }

    // Add back cover
    const backCover = pdfDoc.addPage([pageWidth, pageHeight]);
    backCover.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(0.95, 0.93, 0.88),
    });

    const madeWithText = 'Made with Mission Memory Vault™';
    const madeWithWidth = timesRoman.widthOfTextAtSize(madeWithText, 12);
    backCover.drawText(madeWithText, {
      x: (pageWidth - madeWithWidth) / 2,
      y: margin,
      size: 12,
      font: timesRoman,
      color: rgb(0.5, 0.45, 0.4),
    });

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    
    // Return PDF as base64
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

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
