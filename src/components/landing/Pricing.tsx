import { brandConfig } from "@/config/brandConfig";
import { Star } from "lucide-react";

const Pricing = () => {
  const { pricing } = brandConfig;

  return (
    <section id="pricing" className="py-36 px-6 relative">
      {/* Subtle paper texture */}
      <div className="absolute inset-0 paper-texture pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* Eyebrow */}
        <p className="font-serif-text text-gold text-xs tracking-[0.25em] uppercase mb-5">
          Investment
        </p>

        <h2 className="font-serif text-3xl md:text-4xl mb-4 tracking-wide">
          Simple, Transparent Pricing
        </h2>
        
        <div className="flex justify-center mb-8">
          <div className="w-12 h-px bg-gold/50" />
        </div>
        
        <p className="font-serif-text text-muted-foreground text-lg max-w-2xl mx-auto mb-20">
          No subscriptions. No hidden fees. Just a beautiful book at a fair price.
        </p>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-10 max-w-3xl mx-auto">
          {/* PDF Only */}
          <div className="bg-card border border-stone/20 p-10 rounded shadow-elegant hover:shadow-elegant-lg transition-all duration-500">
            <h3 className="font-serif text-xl mb-2 tracking-wide">Digital PDF</h3>
            <p className="font-serif-text text-muted-foreground text-sm mb-8">Print-ready file</p>
            <p className="font-serif text-4xl mb-8 tracking-tight">${pricing.pdfOnly}</p>
            <ul className="font-serif-text text-muted-foreground space-y-3 text-sm">
              <li className="flex items-center justify-center gap-2">
                <span className="text-gold/70">•</span>
                High-resolution 300 DPI
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="text-gold/70">•</span>
                Immediate download
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="text-gold/70">•</span>
                Print anywhere you choose
              </li>
            </ul>
          </div>

          {/* Printed Book - recommended */}
          <div className="bg-card border-2 border-gold/40 p-10 rounded shadow-elegant-lg hover:shadow-elegant-xl transition-all duration-500 relative">
            {/* Recommended badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1.5 bg-gold/10 border border-gold/30 px-4 py-1 rounded-full">
                <Star className="h-3 w-3 text-gold fill-gold/30" />
                <span className="text-xs font-serif text-gold tracking-wide">Recommended</span>
              </div>
            </div>
            
            <h3 className="font-serif text-xl mb-2 tracking-wide">Printed Hardcover</h3>
            <p className="font-serif-text text-muted-foreground text-sm mb-8">Delivered to your door</p>
            <p className="font-serif text-4xl mb-2 tracking-tight">${pricing.printedBase}</p>
            <p className="font-serif-text text-muted-foreground text-sm mb-8">+ ${pricing.perPage}/page</p>
            <ul className="font-serif-text text-muted-foreground space-y-3 text-sm">
              <li className="flex items-center justify-center gap-2">
                <span className="text-gold/70">•</span>
                Premium layflat hardcover binding
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="text-gold/70">•</span>
                Archival 170gsm silk paper
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="text-gold/70">•</span>
                PDF included free
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="text-gold/70">•</span>
                Shipped with care
              </li>
            </ul>
          </div>
        </div>

        {/* Value explanation */}
        <div className="mt-20 max-w-2xl mx-auto">
          <p className="font-serif-text text-muted-foreground text-sm leading-relaxed mb-12">
            Each book is printed on-demand by professional print partners using archival materials. 
            The price reflects museum-quality construction designed to last generations—not mass-produced shortcuts.
          </p>
        </div>

        {/* Referral mention */}
        <div className="p-8 bg-card/50 border border-gold/20 rounded max-w-xl mx-auto shadow-elegant">
          <p className="font-serif-text text-muted-foreground text-sm">
            <span className="font-serif text-foreground tracking-wide">Share the love:</span>{" "}
            After your purchase, receive a referral code worth ${pricing.referralDiscount} off for friends—and 
            earn ${pricing.referralCredit} credit when they order.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
