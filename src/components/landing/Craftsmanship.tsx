import { brandConfig } from "@/config/brandConfig";

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
    <section className="py-32 px-6 bg-card">
      <div className="max-w-4xl mx-auto">
        {/* Section title */}
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-6">
          Built to Last
        </h2>
        
        <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-20">
          A {brandConfig.name} isn't just a book—it's an heirloom. We partner with 
          professional print houses to ensure every detail meets archival standards.
        </p>

        {/* Quality grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {qualities.map((quality) => (
            <div key={quality.title} className="text-center">
              <h3 className="font-serif text-lg mb-3">{quality.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {quality.description}
              </p>
            </div>
          ))}
        </div>

        {/* Durability statement */}
        <p className="text-center text-muted-foreground mt-16 text-sm italic max-w-lg mx-auto">
          "These aren't meant to sit on a shelf. They're meant to be opened, shared, 
          and passed down—and they're built to withstand that love."
        </p>
      </div>
    </section>
  );
};

export default Craftsmanship;
