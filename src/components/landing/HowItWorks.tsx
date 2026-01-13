import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import stepInviteImg from "@/assets/step-invite.jpg";
import stepCollectImg from "@/assets/step-collect.jpg";
import stepTreasureImg from "@/assets/step-treasure.jpg";

const steps = [
  {
    number: "01",
    title: "Create a Vault",
    description: "Start a memory book for your missionary, graduate, or anyone embarking on a meaningful journey.",
    image: null // Abstract step, no specific image
  },
  {
    number: "02", 
    title: "Invite Contributors",
    description: "Share a simple link or QR code with friends, family, and loved ones who want to add their voice.",
    image: stepInviteImg
  },
  {
    number: "03",
    title: "Collect Messages",
    description: "Contributors add photos, letters, and blessings using guided templates designed for thoughtful reflection.",
    image: stepCollectImg
  },
  {
    number: "04",
    title: "Review & Finalize",
    description: "Preview the complete book, arrange pages, and select which contributions to include.",
    image: null // UI/review step
  },
  {
    number: "05",
    title: "Print & Treasure",
    description: "Receive a beautifully printed hardcover book—or download a print-ready PDF—to keep forever.",
    image: stepTreasureImg
  }
];

const HowItWorks = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: "center",
      skipSnaps: false,
    },
    [
      Autoplay({ 
        delay: 5000, 
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      })
    ]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <section id="how-it-works" className="py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section title */}
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-6">
          How It Works
        </h2>
        <p className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-16">
          Five simple steps from first invitation to treasured keepsake.
        </p>

        {/* Carousel viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="flex-[0_0_100%] min-w-0 md:flex-[0_0_60%] lg:flex-[0_0_50%] px-4"
              >
                <div 
                  className={`
                    bg-card border border-border rounded-lg overflow-hidden
                    transition-all duration-700 ease-out
                    ${selectedIndex === index ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}
                  `}
                >
                  {/* Image or placeholder */}
                  <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
                    {step.image ? (
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bone to-stone/30">
                        <span className="font-serif text-6xl text-charcoal/20">{step.number}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-8">
                    {/* Number badge */}
                    <span className="inline-block font-serif text-stone text-sm mb-3">
                      Step {step.number}
                    </span>
                    
                    {/* Title */}
                    <h3 className="font-serif text-xl md:text-2xl mb-3">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {steps.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to step ${index + 1}`}
              onClick={() => scrollTo(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-500 ease-out
                ${selectedIndex === index 
                  ? 'bg-primary w-8' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }
              `}
            />
          ))}
        </div>

        {/* Subtle progress hint */}
        <p className="text-center text-muted-foreground/50 text-xs mt-6">
          Auto-advances every 5 seconds • Hover to pause
        </p>
      </div>
    </section>
  );
};

export default HowItWorks;
