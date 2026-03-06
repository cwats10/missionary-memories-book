import { brandConfig } from "@/config/brandConfig";
import craftBindingImg from "@/assets/craftsmanship-binding.jpg";

const qualities = [
  {
    title: "Archival-Grade Paper",
    description: "170gsm silk art paper designed to preserve memories for generations without fading or yellowing."
  },
  {
    title: "Hardcover Binding", 
    description: "Layflat case binding allows the book to open completely flat, showcasing photos and text beautifully."
  },
  {
    title: "Print-Ready Resolution",
    description: "Every page is exported at 300 DPI with proper bleed margins, meeting professional printing standards."
  }
];

const Craftsmanship = () => {
  return (
    <section className="py-36 px-6 bg-card">
      <div className="max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <p className="font-serif-text text-gold text-xs tracking-[0.25em] uppercase mb-5">
          Archival Quality
        </p>

        <h2 className="font-serif text-3xl md:text-4xl mb-4 tracking-wide">
          Built to Last Generations
        </h2>
        
        <div className="flex justify-center mb-8">
          <div className="w-12 h-px bg-gold/50" />
        </div>
        
        <p className="font-serif-text text-muted-foreground text-lg max-w-2xl mx-auto mb-20">
          A {brandConfig.name} isn't just a book—it's an heirloom. We partner with 
          professional print houses to ensure every detail meets archival standards.
        </p>

        {/* Image centered */}
        <div className="mb-20 max-w-lg mx-auto">
          <div className="relative">
            <img 
              src={craftBindingImg}
              alt="Close-up of premium hardcover book binding showing archival paper quality"
              className="rounded shadow-elegant-lg w-full"
              loading="lazy"
            />
            <div className="absolute inset-0 rounded bg-gradient-to-t from-charcoal/5 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Quality list centered */}
        <div className="grid md:grid-cols-3 gap-10 mb-20">
          {qualities.map((quality, index) => (
            <div key={quality.title} className="flex flex-col items-center">
              <span className="font-serif text-2xl font-light text-gold/70 tracking-wide mb-4">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-serif text-lg mb-2 tracking-wide">{quality.title}</h3>
              <p className="font-serif-text text-muted-foreground text-sm leading-relaxed max-w-xs">
                {quality.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quote box with decorative styling */}
        <div className="max-w-lg mx-auto border-t border-b border-gold/20 py-12 relative">
          <span className="absolute top-3 left-3 text-gold/30 text-xs">✦</span>
          <span className="absolute top-3 right-3 text-gold/30 text-xs">✦</span>
          <span className="absolute bottom-3 left-3 text-gold/30 text-xs">✦</span>
          <span className="absolute bottom-3 right-3 text-gold/30 text-xs">✦</span>
          
          <p className="font-serif-text text-muted-foreground text-base italic leading-relaxed">
            "These aren't meant to sit on a shelf. They're meant to be opened, shared, 
            and passed down—and they're built to withstand that love."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Craftsmanship;
