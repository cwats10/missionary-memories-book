/**
 * submit-to-prodigi — Supabase Edge Function
 *
 * Generates the vault PDF, stores it in a public Supabase Storage bucket,
 * and creates a Prodigi print order with that PDF URL.
 *
 * Required Supabase secrets (set via `supabase secrets set`):
 *   PRODIGI_API_KEY          Your Prodigi REST API key
 *   PRODIGI_USE_SANDBOX      Set to "true" for sandbox/test mode
 *   PRODIGI_BOOK_SKU         Prodigi SKU for your book product
 *                            Verify in your Prodigi dashboard — the largest
 *                            square hardcover they currently offer is ~21×21 cm
 *                            (8.3×8.3"). Contact Prodigi for 12×12" availability.
 *
 * The PDF is stored in the `print-orders` Supabase Storage bucket.
 * Create this bucket in your Supabase dashboard and set it to PUBLIC.
 *
 * Request body (JSON):
 *   {
 *     vaultId:  string,
 *     shipping: {
 *       name:     string,
 *       email:    string,
 *       phone?:   string,
 *       line1:    string,
 *       line2?:   string,
 *       city:     string,
 *       state:    string,
 *       zip:      string,
 *       country:  string  // ISO 3166-1 alpha-2, e.g. "US"
 *     }
 *   }
 *
 * Response (JSON):
 *   { success: true, prodigiOrderId: string, pdfUrl: string }
 *   or
 *   { success: false, error: string }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Config from env ──────────────────────────────────────────────────────────

const PRODIGI_API_KEY = Deno.env.get('PRODIGI_API_KEY') ?? '';
const USE_SANDBOX = Deno.env.get('PRODIGI_USE_SANDBOX') === 'true';
const BOOK_SKU = Deno.env.get('PRODIGI_BOOK_SKU') ?? 'GLOBAL-PHB-12X12-HC';

const PRODIGI_BASE = USE_SANDBOX
  ? 'https://api.sandbox.prodigi.com/v4.0'
  : 'https://api.prodigi.com/v4.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// ─── Helper: generate PDF by calling the generate-pdf edge function ───────────

async function generatePdf(vaultId: string, authHeader: string): Promise<ArrayBuffer> {
  const url = `${SUPABASE_URL}/functions/v1/generate-pdf`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vaultId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PDF generation failed (${res.status}): ${text}`);
  }

  return res.arrayBuffer();
}

// ─── Helper: upload PDF to Supabase Storage ───────────────────────────────────

async function uploadPdfToStorage(
  supabase: ReturnType<typeof createClient>,
  vaultId: string,
  pdfBytes: ArrayBuffer,
): Promise<string> {
  const path = `prodigi/${vaultId}/${Date.now()}.pdf`;

  const { error } = await supabase.storage
    .from('print-orders')
    .upload(path, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from('print-orders').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Helper: create Prodigi order ────────────────────────────────────────────

async function createProdigiOrder(
  pdfUrl: string,
  shipping: {
    name: string;
    email: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  },
  merchantReference: string,
): Promise<string> {
  const body = {
    merchantReference,
    shippingMethod: 'Budget',
    recipient: {
      name: shipping.name,
      email: shipping.email,
      ...(shipping.phone ? { phoneNumber: shipping.phone } : {}),
      address: {
        line1: shipping.line1,
        ...(shipping.line2 ? { line2: shipping.line2 } : {}),
        townOrCity: shipping.city,
        stateOrCounty: shipping.state,
        postalOrZipCode: shipping.zip,
        countryCode: shipping.country,
      },
    },
    items: [
      {
        sku: BOOK_SKU,
        copies: 1,
        sizing: 'fillPrintArea',
        assets: [
          {
            printArea: 'default',
            url: pdfUrl,
          },
        ],
      },
    ],
  };

  const res = await fetch(`${PRODIGI_BASE}/Orders`, {
    method: 'POST',
    headers: {
      'X-API-Key': PRODIGI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Prodigi API error (${res.status}): ${data?.message ?? JSON.stringify(data)}`,
    );
  }

  // Prodigi returns { order: { id: "ord_..." } } on success
  const orderId: string = data?.order?.id ?? data?.id;
  if (!orderId) throw new Error('Prodigi did not return an order ID');
  return orderId;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!PRODIGI_API_KEY) {
      throw new Error(
        'PRODIGI_API_KEY is not set. Add it via `supabase secrets set PRODIGI_API_KEY=<key>`.',
      );
    }

    const authHeader = req.headers.get('Authorization') ?? '';

    const { vaultId, shipping } = await req.json() as {
      vaultId: string;
      shipping: {
        name: string;
        email: string;
        phone?: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
    };

    if (!vaultId || !shipping?.name || !shipping?.line1) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: vaultId, shipping' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    console.log(`[submit-to-prodigi] Generating PDF for vault ${vaultId}…`);
    const pdfBytes = await generatePdf(vaultId, authHeader);

    console.log(`[submit-to-prodigi] Uploading PDF to storage…`);
    const pdfUrl = await uploadPdfToStorage(supabase, vaultId, pdfBytes);
    console.log(`[submit-to-prodigi] PDF stored at ${pdfUrl}`);

    console.log(`[submit-to-prodigi] Creating Prodigi order (${USE_SANDBOX ? 'SANDBOX' : 'LIVE'})…`);
    const prodigiOrderId = await createProdigiOrder(pdfUrl, shipping, `vault-${vaultId}`);
    console.log(`[submit-to-prodigi] Prodigi order created: ${prodigiOrderId}`);

    // Update vault with the Prodigi order ID stored in description as structured note
    // (until an orders table is added via migration)
    await supabase
      .from('vaults')
      .update({ status: 'submitted' })
      .eq('id', vaultId);

    return new Response(
      JSON.stringify({ success: true, prodigiOrderId, pdfUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[submit-to-prodigi] Error:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
