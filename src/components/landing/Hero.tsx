import { brandConfig } from "@/config/brandConfig";
import heroBookImg from "@/assets/hero-book.jpg";

const Hero = () => {
  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBookImg} 
          alt="" 
          className="w-full h-full object-cover opacity-15"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Brand Name - large and prominent */}
        <div className="mb-4">
          <h2 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tight text-center text-foreground">
            {brandConfig.name}
          </h2>
        </div>

        {/* Headline - feels like a title, not marketing copy */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-center max-w-4xl leading-tight tracking-tight mb-8">
          {brandConfig.tagline}
        </h1>

        {/* Supporting explanation - short, grounded */}
        <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl leading-relaxed mb-12">
          A collaborative memory book where friends and family contribute messages, 
          photos, and blessings, printed as a beautiful keepsake that lasts forever.
        </p>

        {/* Hero image preview */}
        <div className="mb-12 max-w-md mx-auto">
          <img 
            src={heroBookImg}
            alt="A premium hardcover memory book on a wooden table"
            className="rounded-lg shadow-2xl border border-border"
          />
        </div>

        {/* CTA - an invitation, not a command */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="/auth" 
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-medium text-lg rounded transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
          >
            {brandConfig.copy.cta.primary}
          </a>
          <a 
            href="/auth" 
            className="inline-flex items-center justify-center px-8 py-4 border border-primary text-foreground font-medium text-lg rounded transition-all duration-300 hover:bg-primary/5"
          >
            Sign In To Your Vault
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
