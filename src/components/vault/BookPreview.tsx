import { useState } from 'react';
import { Page } from '@/hooks/usePages';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, BookOpen, X } from 'lucide-react';
import { brandConfig } from '@/config/brandConfig';

interface BookPreviewProps {
  recipientName: string;
  missionName?: string | null;
  serviceStartDate?: string | null;
  serviceEndDate?: string | null;
  pages: Page[];
}

export function BookPreview({ recipientName, missionName, serviceStartDate, serviceEndDate, pages }: BookPreviewProps) {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Filter to only show approved pages in the preview
  const approvedPages = pages.filter(p => p.status === 'approved');

  // Book structure: cover, dedication page, then page spreads (2 pages per spread), then back cover
  const contentSpreads = Math.ceil(approvedPages.length / 2);
  const totalSpreads = contentSpreads + 3; // +3 for front cover, dedication, and back cover

  const goToPrevious = () => setCurrentSpread((prev) => Math.max(0, prev - 1));
  const goToNext = () => setCurrentSpread((prev) => Math.min(totalSpreads - 1, prev + 1));

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getSpreadContent = () => {
    if (currentSpread === 0) {
      // Front cover
      return (
        <div className="flex h-full">
          {/* Left side - inside front cover (blank) */}
          <div className="w-1/2 bg-secondary/30 border-r border-border" />
          
          {/* Right side - front cover */}
          <div className="w-1/2 bg-primary flex flex-col items-center justify-center text-primary-foreground p-8">
            <div className="text-center">
              <h2 className="font-serif text-3xl md:text-4xl mb-4">Mission Memory Vault</h2>
              <p className="text-lg opacity-90">{recipientName}</p>
            </div>
          </div>
        </div>
      );
    }

    if (currentSpread === 1) {
      // Dedication page with missionary info
      return (
        <div className="flex h-full">
          {/* Left side - blank */}
          <div className="w-1/2 bg-background border-r border-border" />
          
          {/* Right side - dedication/info page */}
          <div className="w-1/2 bg-background flex flex-col items-center justify-center p-8 text-center">
            <h3 className="font-serif text-2xl md:text-3xl mb-6 text-foreground">
              {recipientName}
            </h3>
            {missionName && (
              <p className="text-lg text-muted-foreground mb-2">
                {missionName}
              </p>
            )}
            {(serviceStartDate || serviceEndDate) && (
              <p className="text-base text-muted-foreground">
                {formatDate(serviceStartDate)} — {formatDate(serviceEndDate)}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (currentSpread === totalSpreads - 1) {
      // Back cover
      return (
        <div className="flex h-full">
          {/* Left side - last page or blank */}
          <div className="w-1/2 bg-background border-r border-border flex items-center justify-center">
            <p className="text-muted-foreground/50 text-sm italic">End of memories</p>
          </div>
          
          {/* Right side - back cover */}
          <div className="w-1/2 bg-primary flex flex-col items-center justify-center text-primary-foreground p-8">
            <p className="font-serif text-xl mb-2">{brandConfig.name}</p>
            <p className="text-sm opacity-70">missionmemoryvault.com</p>
          </div>
        </div>
      );
    }

    // Content spreads (offset by 2 for cover + dedication)
    const pageIndex = (currentSpread - 2) * 2;
    const leftPage = approvedPages[pageIndex];
    const rightPage = approvedPages[pageIndex + 1];

    return (
      <div className="flex h-full">
        {/* Left page */}
        <div className="w-1/2 bg-background border-r border-border p-6 overflow-hidden">
          {leftPage ? (
            <PageContent page={leftPage} pageNumber={pageIndex + 1} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground/40 text-sm">Blank page</p>
            </div>
          )}
        </div>
        
        {/* Right page */}
        <div className="w-1/2 bg-background p-6 overflow-hidden">
          {rightPage ? (
            <PageContent page={rightPage} pageNumber={pageIndex + 2} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground/40 text-sm">Blank page</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <BookOpen className="h-4 w-4" />
          Preview Book
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[80vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif">Book Preview</DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {currentSpread === 0 
                  ? 'Cover' 
                  : currentSpread === 1
                    ? 'Title Page'
                    : currentSpread === totalSpreads - 1 
                      ? 'Back Cover' 
                      : `Pages ${(currentSpread - 2) * 2 + 1}-${Math.min((currentSpread - 2) * 2 + 2, approvedPages.length)}`}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span>{approvedPages.length} memory {approvedPages.length === 1 ? 'page' : 'pages'}</span>
            </div>
          </div>
        </DialogHeader>

        {/* Book viewer */}
        <div className="flex-1 bg-muted/50 flex items-center justify-center p-8">
          <div className="relative w-full max-w-4xl aspect-[3/2] bg-background rounded-lg shadow-2xl overflow-hidden border border-border">
            {/* Book spine effect */}
            <div className="absolute inset-y-0 left-1/2 w-px bg-border -translate-x-1/2 z-10" />
            <div className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 z-0 bg-gradient-to-r from-transparent via-black/5 to-transparent" />
            
            {getSpreadContent()}
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={currentSpread === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: totalSpreads }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSpread(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentSpread 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={currentSpread === totalSpreads - 1}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PageContent({ page, pageNumber }: { page: Page; pageNumber: number }) {
  return (
    <div className="h-full flex flex-col">
      {/* Page number */}
      <div className="text-xs text-muted-foreground/50 mb-4 text-center">
        {pageNumber}
      </div>
      
      {/* Image */}
      {page.image_url && (
        <div className="mb-4 flex-shrink-0">
          <img
            src={page.image_url}
            alt=""
            className="w-full h-32 md:h-40 object-cover rounded"
          />
        </div>
      )}
      
      {/* Title */}
      <h3 className="font-serif text-lg md:text-xl mb-2 text-foreground">
        {page.title || 'Untitled Memory'}
      </h3>
      
      {/* Content */}
      {page.content && (
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 overflow-hidden">
          {page.content}
        </p>
      )}
    </div>
  );
}
