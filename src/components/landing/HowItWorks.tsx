const steps = [
  {
    number: "01",
    title: "Create a Vault",
    description: "Start a memory book for your missionary, graduate, or anyone embarking on a meaningful journey."
  },
  {
    number: "02", 
    title: "Invite Contributors",
    description: "Share a simple link or QR code with friends, family, and loved ones who want to add their voice."
  },
  {
    number: "03",
    title: "Collect Messages",
    description: "Contributors add photos, letters, and blessings using guided templates designed for thoughtful reflection."
  },
  {
    number: "04",
    title: "Review & Finalize",
    description: "Preview the complete book, arrange pages, and select which contributions to include."
  },
  {
    number: "05",
    title: "Print & Treasure",
    description: "Receive a beautifully printed hardcover book—or download a print-ready PDF—to keep forever."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section title - grounded, archival feel */}
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-24">
          How It Works
        </h2>

        {/* Steps - generous spacing, clear hierarchy */}
        <div className="space-y-20">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="flex flex-col md:flex-row gap-6 md:gap-12 items-start"
            >
              {/* Number - subtle, structural */}
              <span className="font-serif text-stone text-2xl md:text-3xl font-light min-w-[3rem]">
                {step.number}
              </span>
              
              <div className="flex-1">
                {/* Title */}
                <h3 className="font-serif text-xl md:text-2xl mb-3">
                  {step.title}
                </h3>
                
                {/* Description - reads like spoken thoughts */}
                <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                  {step.description}
                </p>
              </div>

              {/* Thin divider - gold accent, used sparingly */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 w-px h-full bg-gold/20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
