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
    pdfOnly: 40,
    printedBase: 60,
    perPage: 1,
    referralDiscount: 15,
    referralCredit: 15,
    maxReferralCredits: 120,
    maxReferrals: 8
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
