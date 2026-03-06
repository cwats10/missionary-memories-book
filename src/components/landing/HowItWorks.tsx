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
    image: null
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
    image: null
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
    <section id="how-it-works" className="py-36 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Eyebrow */}
        <p className="font-serif-text text-gold text-xs tracking-[0.25em] uppercase text-center mb-5">
          The Process
        </p>

        <h2 className="font-serif text-3xl md:text-4xl text-center mb-4 tracking-wide">
          From Invitation to Heirloom
        </h2>

        <div className="flex justify-center mb-8">
          <div className="w-12 h-px bg-gold/50" />
        </div>

        <p className="font-serif-text text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-20">
          Five considered steps — each designed to gather the voices that matter most.
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
                    bg-card border border-stone/10 rounded-lg overflow-hidden
                    shadow-elegant
                    transition-all duration-700 ease-in-out
                    ${selectedIndex === index 
                      ? 'opacity-100 scale-100 shadow-elegant-lg' 
                      : 'opacity-40 scale-95'
                    }
                  `}
                >
                  {/* Image or placeholder */}
                  <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden">
                    {step.image ? (
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bone to-stone/20">
                        <span className="font-serif text-6xl text-gold/20">{step.number}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-10">
                    {/* Number badge with gold accent */}
                    <span className="inline-block font-serif text-gold/70 text-sm mb-4 tracking-widest">
                      Step {step.number}
                    </span>
                    
                    {/* Thin divider */}
                    <div className="w-6 h-px bg-gold/30 mb-4" />
                    
                    {/* Title */}
                    <h3 className="font-serif text-xl md:text-2xl mb-4 tracking-wide">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="font-serif-text text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refined dot indicators */}
        <div className="flex justify-center gap-3 mt-12">
          {steps.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to step ${index + 1}`}
              onClick={() => scrollTo(index)}
              className={`
                h-2 rounded-full transition-all duration-500 ease-in-out
                ${selectedIndex === index 
                  ? 'bg-gold w-8' 
                  : 'bg-stone/30 hover:bg-stone/50 w-2'
                }
              `}
            />
          ))}
        </div>

        {/* Subtle progress hint */}
        <p className="text-center font-serif-text text-muted-foreground/40 text-xs mt-8 tracking-wide">
          Auto-advances every 5 seconds • Hover to pause
        </p>
      </div>
    </section>
  );
};

export default HowItWorks;
