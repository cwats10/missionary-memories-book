import { brandConfig } from "@/config/brandConfig";
import heroBookImg from "@/assets/hero-book.jpg";
import GoldDivider from "@/components/decorative/GoldDivider";

const Hero = () => {
  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Background image with overlay and subtle texture */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBookImg} 
          alt="" 
          className="w-full h-full object-cover opacity-10"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        {/* Subtle paper texture */}
        <div className="absolute inset-0 paper-texture" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Brand Name - large, prestigious with refined letter-spacing */}
        <div className="mb-6 animate-fade-up">
          <h2 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-wide text-center text-foreground">
            {brandConfig.name}
          </h2>
        </div>

        {/* Gold ornamental divider */}
        <GoldDivider variant="diamond" className="mb-8 animate-fade-up-delay-1" />

        {/* Headline - elegant serif with refined spacing */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-center max-w-4xl leading-tight tracking-tight mb-8 animate-fade-up-delay-1">
          {brandConfig.tagline}
        </h1>

        {/* Supporting explanation - serif-text for elegance */}
        <p className="font-serif-text text-lg md:text-xl text-muted-foreground text-center max-w-2xl leading-relaxed mb-12 animate-fade-up-delay-2">
          A collaborative memory book where friends and family contribute messages, 
          photos, and blessings—printed as a beautiful keepsake that lasts forever.
        </p>

        {/* Hero image preview with elegant shadow */}
        <div className="mb-12 max-w-md mx-auto animate-fade-up-delay-2">
          <div className="relative">
            <img 
              src={heroBookImg}
              alt="A premium hardcover memory book on a wooden table"
              className="rounded shadow-elegant-xl border border-stone/20"
            />
            {/* Subtle vignette overlay */}
            <div className="absolute inset-0 rounded pointer-events-none bg-gradient-to-t from-background/20 via-transparent to-transparent" />
          </div>
        </div>

        {/* CTA - refined, confident styling */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up-delay-3">
          <a 
            href="/auth?mode=signup" 
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-medium text-lg rounded transition-all duration-300 hover:opacity-90 hover:scale-[1.02] shadow-elegant"
          >
            {brandConfig.copy.cta.primary}
          </a>
          <a 
            href="/auth" 
            className="inline-flex items-center justify-center px-8 py-4 border border-primary/30 text-foreground font-medium text-lg rounded transition-all duration-300 hover:border-gold/50 hover:bg-gold/5"
          >
            Access Your Vault
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
