import { brandConfig } from "@/config/brandConfig";

const Pricing = () => {
  const { pricing } = brandConfig;

  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section title */}
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-8">
          Simple, Transparent Pricing
        </h2>
        
        <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-20">
          No subscriptions. No hidden fees. Just a beautiful book at a fair price.
        </p>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* PDF Only */}
          <div className="bg-card border border-border p-10 rounded text-center">
            <h3 className="font-serif text-xl mb-2">Digital PDF</h3>
            <p className="text-muted-foreground text-sm mb-6">Print-ready file</p>
            <p className="font-serif text-4xl mb-6">${pricing.pdfOnly}</p>
            <ul className="text-left text-muted-foreground space-y-3 text-sm">
              <li>• High-resolution 300 DPI</li>
              <li>• Immediate download</li>
              <li>• Print anywhere you choose</li>
            </ul>
          </div>

          {/* Printed Book */}
          <div className="bg-card border-2 border-primary p-10 rounded text-center">
            <h3 className="font-serif text-xl mb-2">Printed Hardcover</h3>
            <p className="text-muted-foreground text-sm mb-6">Delivered to your door</p>
            <p className="font-serif text-4xl mb-2">${pricing.printedBase}</p>
            <p className="text-muted-foreground text-sm mb-6">+ ${pricing.perPage}/page</p>
            <ul className="text-left text-muted-foreground space-y-3 text-sm">
              <li>• Premium hardcover binding</li>
              <li>• Archival-quality paper</li>
              <li>• PDF included</li>
              <li>• Shipped with care</li>
            </ul>
          </div>
        </div>

        {/* Referral mention */}
        <div className="text-center mt-16 p-8 bg-muted/50 rounded max-w-xl mx-auto">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Share the love:</span> After your purchase, 
            receive a referral code worth ${pricing.referralDiscount} off for friends—and earn ${pricing.referralCredit} credit 
            when they order.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
