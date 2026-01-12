import { brandConfig } from "@/config/brandConfig";

const Footer = () => {
  return (
    <footer className="py-16 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto">
        {/* Brand Name - understated */}
        <div className="flex justify-center mb-8">
          <span className="font-serif text-3xl tracking-tight opacity-70">
            {brandConfig.name}
          </span>
        </div>

        {/* Tagline */}
        <p className="text-center text-muted-foreground text-sm max-w-md mx-auto mb-8">
          {brandConfig.tagline}
        </p>

        {/* Minimal links */}
        <nav className="flex justify-center gap-8 text-sm text-muted-foreground mb-8">
          <a href="/auth" className="hover:text-foreground transition-colors duration-300">
            Sign In
          </a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors duration-300">
            How It Works
          </a>
          <a href="#" className="hover:text-foreground transition-colors duration-300">
            Contact
          </a>
        </nav>

        {/* Copyright */}
        <p className="text-center text-muted-foreground text-xs">
          © {new Date().getFullYear()} {brandConfig.name}{brandConfig.trademark}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
