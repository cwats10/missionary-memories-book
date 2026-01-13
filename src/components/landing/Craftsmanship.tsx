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
    <section className="py-32 px-6 bg-card">
      <div className="max-w-5xl mx-auto">
        {/* Section title */}
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-6">
          Built to Last
        </h2>
        
        <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-16">
          A {brandConfig.name} isn't just a book—it's an heirloom. We partner with 
          professional print houses to ensure every detail meets archival standards.
        </p>

        {/* Two-column layout with image */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <img 
              src={craftBindingImg}
              alt="Close-up of premium hardcover book binding showing archival paper quality"
              className="rounded-lg shadow-lg w-full"
              loading="lazy"
            />
          </div>

          {/* Quality list */}
          <div className="order-1 lg:order-2 space-y-8">
            {qualities.map((quality, index) => (
              <div key={quality.title} className="flex gap-4">
                <span className="font-serif text-stone text-2xl font-light shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-serif text-lg mb-2">{quality.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {quality.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Durability statement */}
        <div className="max-w-lg mx-auto text-center border-t border-border pt-12">
          <p className="text-muted-foreground text-sm italic leading-relaxed">
            "These aren't meant to sit on a shelf. They're meant to be opened, shared, 
            and passed down—and they're built to withstand that love."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Craftsmanship;
