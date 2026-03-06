import { useEffect, useState } from "react";
import { brandConfig } from "@/config/brandConfig";

const SiteNav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top accent rule — single pixel of gold */}
      <div className="fixed top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent z-50" />

      <header
        className={`
          fixed top-px inset-x-0 z-40 transition-all duration-500
          ${scrolled
            ? "bg-background/96 backdrop-blur-md border-b border-gold/15 shadow-elegant"
            : "bg-background/70 backdrop-blur-sm"}
        `}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">

            {/* Left — editorial nav links */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#how-it-works"
                className="font-serif-text text-xs tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 link-elegant"
              >
                How It Works
              </a>
              <a
                href="#books"
                className="font-serif-text text-xs tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 link-elegant"
              >
                The Books
              </a>
              <a
                href="#pricing"
                className="font-serif-text text-xs tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 link-elegant"
              >
                Pricing
              </a>
            </div>

            {/* Center — brand name as masthead */}
            <a
              href="/"
              className="absolute left-1/2 -translate-x-1/2 font-serif tracking-wide text-foreground hover:opacity-70 transition-opacity duration-300 whitespace-nowrap"
              style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)" }}
            >
              {brandConfig.name}
              <sup className="font-serif-text text-[0.5em] text-gold/70 ml-0.5 tracking-normal">™</sup>
            </a>

            {/* Right — CTAs */}
            <div className="flex items-center gap-5">
              <a
                href="/auth"
                className="hidden md:inline font-serif-text text-xs tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 link-elegant"
              >
                Sign In
              </a>
              <a
                href="/auth?mode=signup"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-serif-text text-xs tracking-[0.1em] uppercase rounded transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
              >
                <span>Create a Vault</span>
                <span className="text-gold/80 text-[0.8em]">→</span>
              </a>
            </div>
          </div>
        </nav>

        {/* Bottom rule — fades in on scroll */}
        <div
          className={`h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}
        />
      </header>

      {/* Spacer so content doesn't start under the fixed nav */}
      <div className="h-[65px]" />
    </>
  );
};

export default SiteNav;
