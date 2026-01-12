import { brandConfig } from "@/config/brandConfig";

const Hero = () => {
  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-24">
      {/* Brand Name - large and prominent */}
      <div className="mb-4 opacity-90">
        <h2 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tight text-center">
          {brandConfig.name}
        </h2>
      </div>

      {/* Headline - feels like a title, not marketing copy */}
      <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-center max-w-4xl leading-tight tracking-tight mb-8">
        Preserve the voices, moments, and messages that shape a life-changing journey
      </h1>

      {/* Supporting explanation - short, grounded */}
      <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl leading-relaxed mb-16">
        A collaborative memory book where friends and family contribute messages, 
        photos, and blessings, printed as a beautiful keepsake that lasts forever.
      </p>

      {/* CTA - an invitation, not a command */}
      <div className="flex flex-col sm:flex-row gap-4">
        <a 
          href="/auth" 
          className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-medium text-lg rounded transition-opacity duration-300 hover:opacity-90"
        >
          {brandConfig.copy.cta.primary}
        </a>
        <a 
          href="#how-it-works" 
          className="inline-flex items-center justify-center px-8 py-4 border border-primary text-foreground font-medium text-lg rounded transition-opacity duration-300 hover:bg-primary/5"
        >
          {brandConfig.copy.cta.secondary}
        </a>
      </div>
    </section>
  );
};

export default Hero;
