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
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section title */}
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-20">
          Voices from the Journey
        </h2>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="text-center">
              {/* Quote */}
              <blockquote className="font-serif text-lg leading-relaxed mb-6 text-foreground/90">
                "{testimonial.quote}"
              </blockquote>
              
              {/* Attribution */}
              <cite className="not-italic">
                <p className="font-medium text-foreground mb-1">{testimonial.author}</p>
                <p className="text-muted-foreground text-sm">{testimonial.context}</p>
              </cite>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
