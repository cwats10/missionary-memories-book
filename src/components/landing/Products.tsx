import { brandConfig } from "@/config/brandConfig";

const products = [
  {
    name: brandConfig.products.farewellVault.name,
    meaning: brandConfig.products.farewellVault.meaning,
    description: "For those being sent off on their journey. A collection of encouragement, advice, and love from everyone who will be cheering them on.",
    colorClass: "bg-bone border-stone",
    textClass: "text-charcoal"
  },
  {
    name: brandConfig.products.homecomingVault.name,
    meaning: brandConfig.products.homecomingVault.meaning,
    description: "For those returning changed. Stories, memories, and reflections from the people they touched and the experiences they shared.",
    colorClass: "bg-forest",
    textClass: "text-bone"
  }
];

const Products = () => {
  return (
    <section className="py-32 px-6 bg-card">
      <div className="max-w-5xl mx-auto">
        {/* Section title */}
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-8">
          Choose Your Vault
        </h2>
        
        <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-20">
          Each book is designed for a specific moment in the journey, 
          creating a meaningful ombré across the collection.
        </p>

        {/* Products - card layout with brand colors */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {products.map((product) => (
            <div 
              key={product.name}
              className={`${product.colorClass} ${product.textClass} p-10 md:p-12 rounded border transition-all duration-300`}
            >
              {/* Book name */}
              <h3 className="font-serif text-2xl md:text-3xl mb-3">
                {product.name}
              </h3>
              
              {/* Meaning - subtle, italicized */}
              <p className="text-sm opacity-70 italic mb-6">
                {product.meaning}
              </p>
              
              {/* Description */}
              <p className="text-base leading-relaxed opacity-90">
                {product.description}
              </p>
            </div>
          ))}
        </div>

        {/* Future product hint */}
        <p className="text-center text-muted-foreground mt-16 text-sm">
          <span className="italic">Coming soon:</span> {brandConfig.products.returnedMissionaryVault.name}
        </p>
      </div>
    </section>
  );
};

export default Products;
