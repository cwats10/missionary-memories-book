import { brandConfig } from "@/config/brandConfig";
import heroBookImg from "@/assets/hero-book.jpg";
import GoldDivider from "@/components/decorative/GoldDivider";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background paper texture */}
      <div className="absolute inset-0 paper-texture pointer-events-none z-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 min-h-[88vh] flex flex-col items-center justify-center gap-14 py-20 lg:py-24 text-center">

        {/* ── Book image ─────────────────────────────────────── */}
        <div className="flex items-center justify-center animate-fade-up">
          <div className="relative w-full max-w-sm">

            {/* Outer decorative frames */}
            <div className="absolute -inset-3 border border-gold/10 rounded pointer-events-none" />
            <div className="absolute -inset-6 border border-gold/5 rounded pointer-events-none hidden lg:block" />

            {/* Book image */}
            <div className="relative rounded overflow-hidden shadow-elegant-xl">
              <img
                src={heroBookImg}
                alt="A premium hardcover Mission Memory Vault book on a wooden surface"
                className="w-full h-auto object-cover"
                style={{ aspectRatio: "4/3" }}
              />
              {/* Depth vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-charcoal/5 pointer-events-none" />
              {/* Gold edge-light */}
              <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gold/25 to-transparent" />
              {/* Bottom edge */}
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            </div>

            {/* Museum-label caption */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/25" />
              <p className="font-serif-text text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
                Printed Hardcover · Layflat Binding
              </p>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/25" />
            </div>

            {/* Est. seal */}
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-background border border-gold/30 shadow-elegant flex flex-col items-center justify-center">
              <span className="font-serif-text text-gold/60 text-[8px] tracking-widest uppercase leading-tight">Est.</span>
              <span className="font-serif text-foreground text-sm leading-tight font-light">
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* ── Editorial text ────────────────────────────────── */}
        <div className="flex flex-col items-center">

          {/* Eyebrow */}
          <p className="font-serif-text text-gold text-xs tracking-[0.25em] uppercase mb-6 animate-fade-up">
            A Collaborative Keepsake
          </p>

          {/* Brand masthead */}
          <h1
            className="font-serif text-foreground tracking-wide leading-[0.95] mb-6 animate-fade-up-delay-1"
            style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.5rem)" }}
          >
            {brandConfig.name}
            <sup className="font-serif-text text-gold/60 text-[0.22em] align-top ml-1 tracking-normal">™</sup>
          </h1>

          <GoldDivider variant="diamond" className="mb-8 max-w-[180px] animate-fade-up-delay-1" />

          {/* Tagline */}
          <p
            className="font-serif text-muted-foreground leading-relaxed mb-6 animate-fade-up-delay-2 italic max-w-xl"
            style={{ fontSize: "clamp(1.05rem, 1.8vw, 1.3rem)" }}
          >
            {brandConfig.tagline}
          </p>

          {/* Body */}
          <p
            className="font-serif-text text-muted-foreground leading-relaxed mb-10 max-w-md animate-fade-up-delay-2"
            style={{ fontSize: "clamp(0.88rem, 1.2vw, 0.98rem)" }}
          >
            Invite anyone to contribute messages, photos, and blessings.
            Then approve and print a museum-quality hardcover — an heirloom
            that will be opened for generations.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 animate-fade-up-delay-3 mb-12">
            <a
              href="/auth?mode=signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-primary text-primary-foreground font-serif-text text-sm tracking-[0.08em] rounded transition-all duration-300 hover:opacity-90 hover:scale-[1.02] shadow-elegant"
            >
              {brandConfig.copy.cta.primary}
              <span className="text-gold/80 text-xs">→</span>
            </a>
            <a
              href="/auth"
              className="inline-flex items-center justify-center px-7 py-4 border border-foreground/20 text-foreground font-serif-text text-sm tracking-[0.08em] rounded transition-all duration-300 hover:border-gold/50 hover:bg-gold/5"
            >
              Access Your Vault
            </a>
          </div>

          {/* Trust micro-details */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 animate-fade-up-delay-3">
            {[
              "Archival-grade paper",
              "Layflat hardcover binding",
              "Print-on-demand delivery",
            ].map((detail) => (
              <span
                key={detail}
                className="flex items-center gap-2 font-serif-text text-xs text-muted-foreground"
              >
                <span className="text-gold/50 text-[7px]">◆</span>
                {detail}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom vignette */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default Hero;
