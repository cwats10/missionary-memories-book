import QuoteMark from "@/components/decorative/QuoteMark";

const testimonials = [
  {
    quote: "When our son opened his Farewell Vault before leaving, he couldn't stop crying. Every page was a reminder that he wasn't alone.",
    author: "Sarah M.",
    context: "Mother of Elder serving in Argentina",
    initials: "SM",
  },
  {
    quote: "My daughter didn't know how many lives she had touched until she read her Homecoming Vault. It's the most meaningful gift we've ever given.",
    author: "David & Linda T.",
    context: "Parents of returned missionary",
    initials: "DT",
  },
  {
    quote: "I thought I knew what my mission meant to my family. Reading their words showed me I had no idea. This book is my most treasured possession.",
    author: "Elder K.",
    context: "Returned Missionary, Japan Tokyo Mission",
    initials: "EK",
  },
];

const Testimonials = () => {
  return (
    <section className="py-36 px-6 relative">
      {/* Subtle paper texture background */}
      <div className="absolute inset-0 paper-texture pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Eyebrow */}
        <p className="font-serif-text text-gold text-xs tracking-[0.25em] uppercase text-center mb-5">
          In Their Words
        </p>

        <h2 className="font-serif text-3xl md:text-4xl text-center mb-4 tracking-wide">
          Voices from the Journey
        </h2>

        <div className="flex justify-center mb-20">
          <div className="w-12 h-px bg-gold/50" />
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-card/50 backdrop-blur-sm rounded p-8 pt-10 shadow-elegant border border-stone/10 hover:shadow-elegant-lg hover:-translate-y-1 transition-all duration-500 flex flex-col"
            >
              {/* Corner star ornaments */}
              <span className="absolute top-3 left-3 text-gold/20 text-[9px]">✦</span>
              <span className="absolute top-3 right-3 text-gold/20 text-[9px]">✦</span>

              {/* Monogram initial circle — editorial identifier */}
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
                  <span className="font-serif text-sm text-gold/70 tracking-wider">
                    {testimonial.initials}
                  </span>
                </div>
              </div>

              {/* Opening quote mark */}
              <div className="flex justify-center mb-3">
                <QuoteMark position="open" size="md" />
              </div>

              {/* Quote */}
              <blockquote className="font-serif-text text-sm leading-relaxed mb-8 text-foreground/80 text-center flex-1 italic">
                {testimonial.quote}
              </blockquote>

              {/* Thin gold rule */}
              <div className="w-8 h-px bg-gold/35 mx-auto mb-5" />

              {/* Attribution */}
              <cite className="not-italic text-center">
                <p className="font-serif text-foreground mb-1 tracking-wide text-xs">
                  {testimonial.author}
                </p>
                <p className="text-muted-foreground text-[10px] font-serif-text leading-relaxed">
                  {testimonial.context}
                </p>
              </cite>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
