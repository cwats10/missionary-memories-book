import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brandConfig } from "@/config/brandConfig";
import GoldDivider from "@/components/decorative/GoldDivider";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Paper texture background */}
      <div className="absolute inset-0 paper-texture pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-stone/20 px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <a href="/" className="font-serif text-xl tracking-wide hover:opacity-80 transition-opacity">
            {brandConfig.name}
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div className="text-center max-w-md">
          {/* Decorative icon */}
          <div className="mb-8 relative inline-block">
            <div className="p-6 bg-gold/10 rounded-full border border-gold/20">
              <BookOpen className="h-12 w-12 text-gold" />
            </div>
            {/* Decorative stars */}
            <span className="absolute -top-2 -left-2 text-gold/40 text-xs">✦</span>
            <span className="absolute -top-2 -right-2 text-gold/40 text-xs">✦</span>
            <span className="absolute -bottom-2 -left-2 text-gold/40 text-xs">✦</span>
            <span className="absolute -bottom-2 -right-2 text-gold/40 text-xs">✦</span>
          </div>

          {/* Gold divider */}
          <GoldDivider variant="ornate" className="mb-8" />

          {/* Message */}
          <h1 className="font-serif text-4xl mb-3 tracking-wide">Page Not Found</h1>
          <p className="font-serif-text text-muted-foreground mb-2">
            This page seems to have wandered off the path.
          </p>
          <p className="font-serif-text text-muted-foreground/70 text-sm mb-8">
            Perhaps the memory you seek is waiting elsewhere.
          </p>

          {/* Gold divider */}
          <GoldDivider variant="diamond" className="mb-8" />

          {/* Action */}
          <Button 
            asChild
            className="font-serif transition-all duration-200 hover:scale-[1.02]"
          >
            <a href="/">Return Home</a>
          </Button>
        </div>
      </main>

      {/* Footer accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </div>
  );
};

export default NotFound;
