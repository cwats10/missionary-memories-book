import { brandConfig } from "@/config/brandConfig";

const products = [
  {
    name: brandConfig.products.farewellVault.name,
    meaning: brandConfig.products.farewellVault.meaning,
    description: "For those being sent off on their journey. A collection of encouragement, advice, and love from everyone who will be cheering them on.",
    colorClass: "bg-bone",
    textClass: "text-charcoal",
    hasTexture: true,
  },
  {
    name: brandConfig.products.homecomingVault.name,
    meaning: brandConfig.products.homecomingVault.meaning,
    description: "For those returning changed. Stories, memories, and reflections from the people they touched and the experiences they shared.",
    colorClass: "bg-forest",
    textClass: "text-bone",
    hasTexture: false,
  }
];

const Products = () => {
  return (
    <section id="books" className="py-36 px-6 bg-card">
      <div className="max-w-5xl mx-auto">
        {/* Eyebrow */}
        <p className="font-serif-text text-gold text-xs tracking-[0.25em] uppercase text-center mb-5">
          The Collection
        </p>

        <h2 className="font-serif text-3xl md:text-4xl text-center mb-4 tracking-wide">
          Books for Every Moment
        </h2>

        <div className="flex justify-center mb-8">
          <div className="w-12 h-px bg-gold/50" />
        </div>

        <p className="font-serif-text text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-20">
          Each volume is designed for a specific inflection point — together,
          they form a complete record of a life-changing season.
        </p>

        {/* Book-cover cards */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-14">
          {products.map((product) => (
            <div
              key={product.name}
              className={`
                ${product.colorClass} ${product.textClass}
                relative overflow-hidden rounded
                shadow-elegant-xl
                border border-stone/10
                transition-all duration-500 ease-out
                hover:shadow-elegant-xl hover:-translate-y-1.5
                hover:border-gold/30
                group
              `}
            >
              {/* Simulated book spine — thin left strip */}
              <div className="absolute left-0 top-0 bottom-0 w-5 bg-black/10 flex items-center justify-center overflow-hidden">
                <span
                  className="text-current opacity-20 font-serif text-[9px] tracking-[0.3em] uppercase"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  Mission Memory Vault™
                </span>
              </div>

              {product.hasTexture && (
                <div className="absolute inset-0 paper-texture pointer-events-none" />
              )}

              {/* Top gold rule */}
              <div className="absolute top-0 left-5 right-0 h-px bg-gradient-to-r from-gold/30 via-gold/15 to-transparent" />

              <div className="relative z-10 pl-10 pr-10 pt-12 pb-12 md:pl-12 md:pr-12 md:pt-14 md:pb-14">
                {/* Volume number */}
                <p className="font-serif-text text-xs tracking-[0.3em] uppercase opacity-40 mb-5">
                  Volume {products.indexOf(product) === 0 ? "I" : "II"}
                </p>

                {/* Title */}
                <h3 className="font-serif text-2xl md:text-3xl mb-3 tracking-wide leading-tight">
                  {product.name}
                </h3>

                {/* Meaning */}
                <p className="text-xs opacity-50 italic mb-7 font-serif-text tracking-wide">
                  — {product.meaning}
                </p>

                {/* Thin rule */}
                <div className="w-10 h-px bg-current opacity-20 mb-7" />

                {/* Description */}
                <p className="text-sm leading-relaxed opacity-75 font-serif-text">
                  {product.description}
                </p>

                {/* Corner ornament */}
                <span className="absolute bottom-5 right-6 text-current opacity-10 text-lg">✦</span>
              </div>

              {/* Bottom gold rule */}
              <div className="absolute bottom-0 left-5 right-0 h-px bg-gradient-to-r from-gold/20 via-transparent to-transparent" />

              {/* Hover gold edge highlight */}
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/0 to-transparent group-hover:via-gold/30 transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* Future product hint */}
        <div className="flex items-center justify-center gap-4 mt-20">
          <div className="h-px w-12 bg-gold/20" />
          <p className="text-center text-muted-foreground text-sm font-serif-text">
            <span className="italic opacity-60">Coming soon —</span>{" "}
            <span className="tracking-wide">{brandConfig.products.returnedMissionaryVault.name}</span>
          </p>
          <div className="h-px w-12 bg-gold/20" />
        </div>
      </div>
    </section>
  );
};

export default Products;
