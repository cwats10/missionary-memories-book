import { BookOpen } from 'lucide-react';
import GoldDivider from '@/components/decorative/GoldDivider';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center relative">
      {/* Paper texture background */}
      <div className="absolute inset-0 paper-texture pointer-events-none rounded-lg" />
      
      {/* Decorative border */}
      <div className="absolute inset-4 border border-dashed border-gold/20 rounded-lg pointer-events-none" />
      
      <div className="relative z-10">
        {/* Icon with gold accents */}
        <div className="relative mb-8 inline-block">
          <div className="p-5 bg-gold/10 rounded-full border border-gold/20">
            <BookOpen className="h-10 w-10 text-gold" />
          </div>
          {/* Decorative stars */}
          <span className="absolute -top-1 -left-1 text-gold/40 text-[10px]">✦</span>
          <span className="absolute -top-1 -right-1 text-gold/40 text-[10px]">✦</span>
        </div>

        {/* Gold divider */}
        <GoldDivider variant="diamond" className="mb-6 max-w-[200px] mx-auto" />

        {/* Text content */}
        <h3 className="font-serif text-2xl mb-3 tracking-wide">No vaults yet</h3>
        <p className="font-serif-text text-muted-foreground max-w-sm leading-relaxed">
          Create your first memory vault to start collecting messages, photos, and cherished memories 
          from friends and family.
        </p>

        {/* Gold divider */}
        <GoldDivider variant="simple" className="mt-6 max-w-[120px] mx-auto" />
      </div>
    </div>
  );
}
