import QuoteMark from "@/components/decorative/QuoteMark";

const testimonials = [
  {
    quote: "When our son opened his Farewell Vault before leaving, he couldn't stop crying. Every page was a reminder that he wasn't alone.",
    author: "Sarah M.",
    context: "Mother of Elder serving in Argentina"
  },
  {
    quote: "My daughter didn't know how many lives she had touched until she read her Homecoming Vault. It's the most meaningful gift we've ever given.",
    author: "David & Linda T.",
    context: "Parents of returned missionary"
  },
  {
    quote: "I thought I knew what my mission meant to my family. Reading their words showed me I had no idea. This book is my most treasured possession.",
    author: "Elder K.",
    context: "Returned Missionary, Japan Tokyo Mission"
  }
];

const Testimonials = () => {
  return (
    <section className="py-36 px-6 relative">
      {/* Subtle paper texture background */}
      <div className="absolute inset-0 paper-texture pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section title with gold accent */}
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-4 tracking-wide">
          Voices from the Journey
        </h2>
        
        <div className="flex justify-center mb-20">
          <div className="w-12 h-px bg-gold/50" />
        </div>

        {/* Testimonials grid with refined cards */}
        <div className="grid md:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="text-center bg-card/50 backdrop-blur-sm rounded-lg p-8 shadow-elegant border border-stone/10 hover:shadow-elegant-lg transition-all duration-500"
            >
              {/* Decorative quote mark */}
              <div className="flex justify-center mb-4">
                <QuoteMark position="open" size="md" />
              </div>
              
              {/* Quote with refined typography */}
              <blockquote className="font-serif-text text-base leading-relaxed mb-8 text-foreground/85">
                {testimonial.quote}
              </blockquote>
              
              {/* Thin gold rule */}
              <div className="w-8 h-px bg-gold/40 mx-auto mb-6" />
              
              {/* Attribution */}
              <cite className="not-italic">
                <p className="font-serif text-foreground mb-1 tracking-wide text-sm">{testimonial.author}</p>
                <p className="text-muted-foreground text-xs font-serif-text">{testimonial.context}</p>
              </cite>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
