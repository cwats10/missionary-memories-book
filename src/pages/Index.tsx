import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Products from "@/components/landing/Products";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background font-sans">
      {/* 
        Mission Memory Vault™ Landing Page
        
        Design Philosophy:
        - Calm, unrushed, respectful
        - Like entering a quiet, well-lit archive
        - Headlines feel like titles, not marketing copy
        - CTAs are invitations, not commands
        - Generous bone/parchment space
        - Motion nearly invisible
      */}
      
      <Hero />
      
      {/* Thin divider - gold accent used sparingly */}
      <div className="max-w-xs mx-auto h-px bg-gold/30" />
      
      <HowItWorks />
      
      <Products />
      
      <div className="max-w-xs mx-auto h-px bg-gold/30" />
      
      <Pricing />
      
      <Footer />
    </main>
  );
};

export default Index;
