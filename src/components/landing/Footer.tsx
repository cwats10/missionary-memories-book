import { brandConfig } from "@/config/brandConfig";
import GoldDivider from "@/components/decorative/GoldDivider";

const Footer = () => {
  return (
    <footer className="py-20 px-6 border-t border-gold/20 relative">
      {/* Subtle paper texture */}
      <div className="absolute inset-0 paper-texture pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Ornate divider */}
        <GoldDivider variant="ornate" className="mb-12" />
        
        {/* Brand Name - elegant serif */}
        <div className="flex justify-center mb-8">
          <span className="font-serif text-3xl tracking-wide opacity-80">
            {brandConfig.name}
          </span>
        </div>

        {/* Tagline */}
        <p className="text-center font-serif-text text-muted-foreground text-sm max-w-md mx-auto mb-10">
          {brandConfig.tagline}
        </p>

        {/* Refined navigation links */}
        <nav className="flex justify-center gap-10 text-sm text-muted-foreground mb-10">
          <a 
            href="/auth" 
            className="link-elegant hover:text-foreground transition-colors duration-300 font-serif-text"
          >
            Sign In
          </a>
          <a 
            href="#how-it-works" 
            className="link-elegant hover:text-foreground transition-colors duration-300 font-serif-text"
          >
            How It Works
          </a>
          <a 
            href="#" 
            className="link-elegant hover:text-foreground transition-colors duration-300 font-serif-text"
          >
            Contact
          </a>
        </nav>

        {/* Gold divider before copyright */}
        <div className="flex justify-center mb-6">
          <div className="w-8 h-px bg-gold/30" />
        </div>

        {/* Copyright */}
        <p className="text-center text-muted-foreground text-xs font-serif-text">
          © {new Date().getFullYear()} {brandConfig.name}{brandConfig.trademark}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
