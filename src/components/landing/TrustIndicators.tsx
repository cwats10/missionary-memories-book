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
    <section className="py-16 px-6 border-y border-border bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {indicators.map((item) => (
            <div key={item.title} className="text-center">
              <item.icon className="h-6 w-6 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="font-medium text-sm mb-1">{item.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
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
