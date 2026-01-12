import { useEffect, useMemo, useCallback, useState } from "react";
import { Page } from "@/hooks/usePages";
import { VaultType } from "@/hooks/useVaults";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { brandConfig } from "@/config/brandConfig";

interface BookPreviewProps {
  recipientName: string;
  missionName?: string | null;
  serviceStartDate?: string | null;
  serviceEndDate?: string | null;
  pages: Page[];
  vaultType: VaultType;
}

const getCoverColors = (vaultType: VaultType) => {
  switch (vaultType) {
    case 'farewell':
      return {
        bg: brandConfig.colors.boneParchment.hex,
        text: brandConfig.colors.deepCharcoal.hex,
      };
    case 'homecoming':
      return {
        bg: brandConfig.colors.deepForest.hex,
        text: '#F4F1EC',
      };
    case 'returned':
      return {
        bg: brandConfig.colors.deepCharcoal.hex,
        text: '#F4F1EC',
      };
  }
};

export function BookPreview({
  recipientName,
  missionName,
  serviceStartDate,
  serviceEndDate,
  pages,
  vaultType,
}: BookPreviewProps) {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const coverColors = getCoverColors(vaultType);

  // Filter to only show approved pages in the preview
  const approvedPages = useMemo(() => pages.filter((p) => p.status === "approved"), [pages]);

  // Book structure: cover, title page, content spreads (2 pages/spread), back cover
  const contentSpreads = Math.ceil(approvedPages.length / 2);
  const totalSpreads = contentSpreads + 3;

  const goToPrevious = useCallback(() => {
    setCurrentSpread((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSpread((prev) => Math.min(totalSpreads - 1, prev + 1));
  }, [totalSpreads]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, goToNext, goToPrevious]);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getSpreadContent = () => {
    if (currentSpread === 0) {
      // Front cover
      return (
        <div className="flex h-full">
          {/* Inside front cover */}
          <div className="w-1/2 border-r border-border bg-background" />

          {/* Front cover */}
          <div
            className="w-1/2 flex flex-col items-center justify-center px-12"
            style={{ backgroundColor: coverColors.bg }}
          >
            <div className="text-center">
              <h2
                className="font-serif text-xl md:text-2xl"
                style={{ color: coverColors.text }}
              >
                Mission Memory Vault
              </h2>
            </div>
          </div>
        </div>
      );
    }

    if (currentSpread === 1) {
      // Title page
      return (
        <div className="flex h-full">
          <div className="w-1/2 border-r border-border bg-background" />

          <div className="w-1/2 flex flex-col items-center justify-center p-8 text-center bg-background">
            <h3 className="font-serif text-2xl md:text-3xl mb-6 text-foreground">{recipientName}</h3>
            {missionName && <p className="font-serif text-lg mb-2 text-foreground/80">{missionName}</p>}
            {(serviceStartDate || serviceEndDate) && (
              <p className="text-base text-foreground/70">
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
          <div className="w-1/2 border-r border-border flex items-center justify-center bg-background">
            <p className="text-sm italic font-serif text-foreground/50">End of memories</p>
          </div>

          <div
            className="w-1/2 flex flex-col items-center justify-center p-8"
            style={{ backgroundColor: coverColors.bg }}
          >
            <p
              className="text-xl mb-2 font-serif"
              style={{ color: coverColors.text }}
            >
              {brandConfig.name}
            </p>
            <p
              className="text-sm"
              style={{ color: coverColors.text, opacity: 0.8 }}
            >
              missionmemoryvault.com
            </p>
          </div>
        </div>
      );
    }

    // Content spreads (offset by 2 for cover + title)
    const pageIndex = (currentSpread - 2) * 2;
    const leftPage = approvedPages[pageIndex];
    const rightPage = approvedPages[pageIndex + 1];

    return (
      <div className="flex h-full">
        <div className="w-1/2 bg-background border-r border-border p-4 overflow-hidden">
          {leftPage ? (
            <PageContent page={leftPage} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground/40 text-sm">Blank page</p>
            </div>
          )}
        </div>

        <div className="w-1/2 bg-background p-4 overflow-hidden">
          {rightPage ? (
            <PageContent page={rightPage} />
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setCurrentSpread(0);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" type="button">
          <BookOpen className="h-4 w-4" />
          Preview Book
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl h-[80vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-3 border-b border-border bg-secondary/30 flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="font-serif">Book Preview</DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {currentSpread === 0
                  ? "Cover"
                  : currentSpread === 1
                    ? "Title Page"
                    : currentSpread === totalSpreads - 1
                      ? "Back Cover"
                      : `Pages ${(currentSpread - 2) * 2 + 1}-${Math.min((currentSpread - 2) * 2 + 2, approvedPages.length)}`}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span>
                {approvedPages.length} memory {approvedPages.length === 1 ? "page" : "pages"}
              </span>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Preview the book cover, title page, and memory pages. Use Next and Previous to turn pages.
          </DialogDescription>
        </DialogHeader>

        {/* Book viewer */}
        <div className="flex-1 min-h-0 bg-muted/50 flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="relative h-full max-h-full aspect-[3/2] w-auto max-w-full bg-background rounded-lg shadow-2xl overflow-hidden border border-border">
            {/* Book spine effect */}
            <div className="absolute inset-y-0 left-1/2 w-px bg-border -translate-x-1/2 z-10" />
            <div className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 z-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />

            {getSpreadContent()}

            {/* Click-to-turn areas (helps on small screens if footer is clipped) */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              <button
                type="button"
                aria-label="Previous page spread"
                onClick={goToPrevious}
                disabled={currentSpread === 0}
                className="pointer-events-auto absolute inset-y-0 left-0 w-[22%] disabled:pointer-events-none"
              />
              <button
                type="button"
                aria-label="Next page spread"
                onClick={goToNext}
                disabled={currentSpread === totalSpreads - 1}
                className="pointer-events-auto absolute inset-y-0 right-0 w-[22%] disabled:pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={goToPrevious}
            disabled={currentSpread === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-1.5">
            {Array.from({ length: totalSpreads }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to spread ${i + 1}`}
                onClick={() => setCurrentSpread(i)}
                className={
                  "w-2 h-2 rounded-full transition-colors " +
                  (i === currentSpread
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50")
                }
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            type="button"
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

function PageContent({ page }: { page: Page }) {
  const imageAlt = page.title ? `Photo for ${page.title}` : "Memory photo";
  const images = page.image_urls?.length > 0 ? page.image_urls : page.image_url ? [page.image_url] : [];
  const hasImages = images.length > 0;
  const hasContent = page.content && page.content.trim().length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Title - centered, only show if exists */}
      {page.title && <h3 className="font-serif text-sm md:text-base mb-2 text-foreground leading-tight text-center">{page.title}</h3>}

      {/* Images - smaller when content present to maximize text space */}
      {hasImages && (
        <div className={`mb-2 flex-shrink-0 grid gap-1 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {images.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`${imageAlt} ${index + 1}`}
              loading="lazy"
              className={`w-full object-contain rounded bg-muted/30 ${
                hasContent 
                  ? (images.length === 1 ? 'max-h-20 md:max-h-24' : 'max-h-14 md:max-h-18')
                  : (images.length === 1 ? 'max-h-48 md:max-h-56' : 'max-h-32 md:max-h-40')
              }`}
            />
          ))}
        </div>
      )}

      {/* Content text - maximized space, smaller line height */}
      {hasContent && (
        <p className="font-sans text-[10px] md:text-xs text-muted-foreground leading-snug flex-1 overflow-hidden">
          {page.content}
        </p>
      )}
    </div>
  );
}

