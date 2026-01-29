import { Shield, RefreshCw, Lock, MessageCircle } from "lucide-react";

const indicators = [
  {
    icon: Shield,
    title: "Satisfaction Guaranteed",
    description: "If your book arrives damaged, we'll replace it at no cost."
  },
  {
    icon: RefreshCw,
    title: "Free Revisions",
    description: "Preview before printing. Request changes until it's perfect."
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description: "Your memories stay yours. We never share or sell contributor data."
  },
  {
    icon: MessageCircle,
    title: "Real Support",
    description: "Questions? Our team responds within 24 hours, usually sooner."
  }
];

const TrustIndicators = () => {
  return (
    <section className="py-20 px-6 border-y border-gold/20 bg-gradient-to-b from-muted/20 to-muted/40">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {indicators.map((item) => (
            <div 
              key={item.title} 
              className="text-center group hover-lift cursor-default"
            >
              {/* Icon with gold accent on hover */}
              <div className="flex justify-center mb-4">
                <item.icon 
                  className="h-6 w-6 text-muted-foreground group-hover:text-gold transition-colors duration-300" 
                  strokeWidth={1.5} 
                />
              </div>
              <h3 className="font-serif text-sm mb-2 tracking-wide">{item.title}</h3>
              <p className="font-serif-text text-muted-foreground text-xs leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
