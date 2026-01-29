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
    <section className="py-36 px-6 bg-card">
      <div className="max-w-5xl mx-auto">
        {/* Section title with refined spacing */}
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-4 tracking-wide">
          Choose Your Vault
        </h2>
        
        {/* Gold accent below title */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-px bg-gold/50" />
        </div>
        
        <p className="font-serif-text text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-20">
          Each book is designed for a specific moment in the journey, 
          creating a meaningful ombré across the collection.
        </p>

        {/* Products - refined card layout with emboss effect */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-14">
          {products.map((product) => (
            <div 
              key={product.name}
              className={`
                ${product.colorClass} ${product.textClass} 
                p-12 md:p-14 rounded 
                shadow-emboss
                border border-stone/10
                transition-all duration-500 ease-out
                hover:shadow-elegant-lg hover:-translate-y-1
                hover:border-gold/30
                relative overflow-hidden
              `}
            >
              {/* Subtle paper texture on bone card */}
              {product.hasTexture && (
                <div className="absolute inset-0 paper-texture pointer-events-none" />
              )}
              
              <div className="relative z-10">
                {/* Book name with refined tracking */}
                <h3 className="font-serif text-2xl md:text-3xl mb-4 tracking-wide">
                  {product.name}
                </h3>
                
                {/* Meaning - decorative italic with em-dash */}
                <p className="text-sm opacity-60 italic mb-8 font-serif-text">
                  —{product.meaning}
                </p>
                
                {/* Description with generous line height */}
                <p className="text-base leading-relaxed opacity-85 font-serif-text">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Future product hint - refined styling */}
        <p className="text-center text-muted-foreground mt-20 text-sm font-serif-text">
          <span className="italic opacity-70">Coming soon:</span>{" "}
          <span className="tracking-wide">{brandConfig.products.returnedMissionaryVault.name}</span>
        </p>
      </div>
    </section>
  );
};

export default Products;
