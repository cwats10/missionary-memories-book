import GoldDivider from "@/components/decorative/GoldDivider";

const LegacyStatement = () => {
  return (
    <section className="relative py-28 px-6 overflow-hidden bg-foreground">
      {/* Subtle noise texture on dark bg */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Faint gold vignette edges */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Top ornament */}
        <div className="flex items-center justify-center gap-5 mb-12">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40" />
          <span className="text-gold/50 text-[10px] tracking-[0.4em] uppercase font-serif-text">Legacy</span>
          <span className="text-gold text-xs">◆</span>
          <span className="text-gold/50 text-[10px] tracking-[0.4em] uppercase font-serif-text">Memory</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* Main statement */}
        <blockquote>
          <p
            className="font-serif text-background leading-tight tracking-wide mb-8"
            style={{ fontSize: "clamp(1.7rem, 4vw, 3rem)" }}
          >
            "Some moments deserve more than
            a memory. They deserve a monument."
          </p>
        </blockquote>

        <GoldDivider variant="ornate" className="mb-10 max-w-[200px] mx-auto" />

        {/* Supporting statement */}
        <p className="font-serif-text text-background/60 leading-relaxed max-w-xl mx-auto" style={{ fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)" }}>
          A Mission Memory Vault{" "}
          <sup className="text-gold/50 text-[0.65em]">™</sup> gathers every
          voice that mattered — the mentors, the friends, the family — and
          binds them into one enduring object that says:
          <em className="text-background/80 not-italic font-serif"> you were here, and you changed us.</em>
        </p>

        {/* Bottom CTA — subtle */}
        <div className="mt-14">
          <a
            href="/auth?mode=signup"
            className="inline-flex items-center gap-3 font-serif-text text-xs tracking-[0.2em] uppercase text-background/60 hover:text-background transition-colors duration-300 group"
          >
            <span className="h-px w-8 bg-gold/40 group-hover:w-12 transition-all duration-300" />
            Begin Your Vault
            <span className="text-gold/60 group-hover:text-gold transition-colors duration-300">→</span>
            <span className="h-px w-8 bg-gold/40 group-hover:w-12 transition-all duration-300" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default LegacyStatement;
