/**
 * Mission Memory Vault™ - White-Label Brand Configuration
 * 
 * This is the central configuration file for the entire brand system.
 * To create a new branded version of this app:
 * 1. Remix this project
 * 2. Update this file with new brand values
 * 3. Replace logo in src/assets/
 * 
 * All colors, copy, and settings flow from this single source.
 */

export const brandConfig = {
  // === BRAND IDENTITY ===
  name: "Mission Memory Vault",
  tagline: "Preserving the voices, moments, and messages that shape a life-changing journey",
  trademark: "™",
  
  // === BRAND WORDS ===
  essence: [
    "Intentional",
    "Grounded", 
    "Reverent",
    "Warm",
    "Enduring"
  ],

  // === LOGO ===
  logo: {
    path: "/src/assets/logo.png",
    alt: "Mission Memory Vault",
  },

  // === COLORS (HSL values for Tailwind) ===
  colors: {
    // Primary Identity
    deepCharcoal: {
      hsl: "60 2% 16%", // #2B2B2A
      hex: "#2B2B2A",
      usage: "Logo, headlines, body text, spines, formal UI",
      meaning: "Authority, permanence, trust"
    },
    
    // Primary Light Background
    boneParchment: {
      hsl: "40 33% 94%", // #F4F1EC
      hex: "#F4F1EC", 
      usage: "Website backgrounds, Farewell covers, interior pages, packaging",
      meaning: "Reverence, calm, space"
    },
    
    // Structural Support
    warmStone: {
      hsl: "36 15% 75%", // #C9C3B8
      hex: "#C9C3B8",
      usage: "Section dividers, UI cards, panels, framing elements",
      meaning: "Grounded, natural, unobtrusive"
    },
    
    // Depth / Experience
    deepForest: {
      hsl: "152 14% 22%", // #2F3E36
      hex: "#2F3E36",
      usage: "Homecoming covers, deep sections, feature callouts",
      meaning: "Growth, experience, maturity",
      restrictions: "Never used for logos or body text"
    },
    
    // Accent (Use Sparingly)
    mutedGold: {
      hsl: "46 32% 57%", // #B8A66A
      hex: "#B8A66A",
      usage: "Foil stamping, embossing accents, thin rules only",
      meaning: "Honor, significance",
      restrictions: "Never for logos, headings, buttons, or backgrounds"
    }
  },

  // === BOOK PRODUCTS ===
  products: {
    farewellVault: {
      name: "Farewell Vault",
      color: "boneParchment",
      meaning: "Anticipation • Openness • Being sent"
    },
    homecomingVault: {
      name: "Homecoming Vault", 
      color: "deepForest",
      meaning: "Experience • Growth • Change"
    },
    returnedMissionaryVault: {
      name: "Returned Missionary Vault",
      color: "deepCharcoal",
      meaning: "Integration • Ownership • Permanence",
      status: "future"
    }
  },

  // === PRICING ===
  pricing: {
    // Digital PDF
    pdfOnly: 40,
    // Standard Print — fulfilled automatically via Prodigi
    printedBase: 149,
    perPage: 0,
    // Heirloom Edition — fulfilled manually via Printique, hand-delivered
    heirloomBase: 449,
    heirloomPerPage: 0,
    // Referral program
    referralDiscount: 15,
    referralCredit: 15,
    maxReferralCredits: 120,
    maxReferrals: 8
  },

  // === PRODIGI PRINT API ===
  // Standard print orders are submitted automatically to Prodigi.
  // Set PRODIGI_API_KEY as a Supabase edge function secret.
  // Set PRODIGI_USE_SANDBOX=true in edge function env for testing.
  // Verify your book SKU in your Prodigi dashboard product catalog —
  // the largest square hardcover they currently offer is ~21×21 cm (8.3×8.3").
  // If your book is 12×12" you may need to adjust sizing or contact Prodigi support.
  prodigi: {
    apiBase: 'https://api.prodigi.com/v4.0',
    sandboxBase: 'https://api.sandbox.prodigi.com/v4.0',
    // Update this SKU from your Prodigi dashboard after confirming availability
    bookSku: 'GLOBAL-PHB-12X12-HC',
    shippingMethod: 'Budget' as const,
  },

  // === PRINTIQUE (Heirloom Edition) ===
  // Printique does not have a public API. Heirloom orders follow a manual flow:
  //   1. Admin downloads the vault PDF
  //   2. Admin uploads and orders on printique.com
  //   3. Admin picks up the finished book
  //   4. Admin hand-delivers to recipient
  // The admin dashboard flags these orders for manual action.
  printique: {
    website: 'https://www.printique.com',
    notes: 'Museum-quality lay-flat albums. Allow 10–14 business days for production.',
  },

  // === COPY & LANGUAGE ===
  copy: {
    // CTAs (invitations, not commands)
    cta: {
      primary: "Create a Vault",
      secondary: "Learn How It Works",
      continue: "Continue",
      viewExample: "See an Example"
    },
    // Avoid these phrases
    avoid: [
      "Get started",
      "Join now", 
      "Don't miss out",
      "Limited time",
      "Act now"
    ]
  },

  // === DESIGN PHILOSOPHY ===
  design: {
    // The site should feel like:
    shouldFeelLike: [
      "a museum exhibit label",
      "a publishing house website",
      "a heritage brand lookbook",
      "an archival collection page"
    ],
    // The site should NOT feel like:
    shouldNotFeelLike: [
      "a Shopify store",
      "a blog",
      "a personal brand",
      "a tech platform",
      "a startup",
      "an ecommerce funnel",
      "a SaaS product",
      "a marketing page"
    ],
    // Success standard
    successFeeling: "That felt important. I don't need to decide right now—but I want to come back."
  },

  // === MOTION GUIDELINES ===
  motion: {
    allowed: ["gentle fades", "subtle transitions"],
    forbidden: ["bounce", "parallax", "auto-playing media", "carousels", "rapid changes"]
  },

  // === ROLES ===
  roles: {
    owner: "Owner",
    coOwner: "Co-owner", 
    contributor: "Contributor"
  }
} as const;

export type BrandConfig = typeof brandConfig;
