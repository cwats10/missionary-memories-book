import { brandConfig } from "@/config/brandConfig";
import GoldDivider from "@/components/decorative/GoldDivider";

const navColumns = [
  {
    heading: "Product",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "The Books", href: "#books" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign In", href: "/auth" },
      { label: "Create a Vault", href: "/auth?mode=signup" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-gold/20 bg-card">
      {/* Paper texture */}
      <div className="absolute inset-0 paper-texture pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">

        {/* ── Upper footer: brand + nav ───────────────────── */}
        <div className="py-16 lg:py-20 flex flex-col items-center text-center gap-12">

          {/* Brand column */}
          <div>
            <GoldDivider variant="diamond" className="mb-8 max-w-[140px] mx-auto" />

            <p className="font-serif text-2xl tracking-wide text-foreground mb-4">
              {brandConfig.name}
              <sup className="font-serif-text text-gold/60 text-[0.4em] ml-0.5 tracking-normal">™</sup>
            </p>

            <p className="font-serif-text text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto mb-8 italic">
              {brandConfig.tagline}
            </p>

            {/* Essence words */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {brandConfig.essence.map((word) => (
                <span
                  key={word}
                  className="font-serif-text text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {navColumns.map((col) => (
              <div key={col.heading}>
                <p className="font-serif-text text-[10px] tracking-[0.25em] uppercase text-gold/70 mb-5">
                  {col.heading}
                </p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="font-serif-text text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 link-elegant"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────── */}
        <div className="border-t border-gold/15 py-7 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-px w-6 bg-gold/25" />
            <span className="text-gold/40 text-[8px]">◆</span>
            <div className="h-px w-6 bg-gold/25" />
          </div>

          <p className="font-serif-text text-xs text-muted-foreground/60">
            © {year} {brandConfig.name}{brandConfig.trademark}. All rights reserved.
          </p>

          <p className="font-serif-text text-xs text-muted-foreground/40 italic">
            Heirloom quality, printed on demand.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
