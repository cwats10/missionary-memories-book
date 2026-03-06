import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Heart, Image, FileText, Camera, ChevronRight, ChevronLeft, Upload, X, CheckCircle } from 'lucide-react';
import { CreatePageInput } from '@/hooks/usePages';
import { useImageUpload } from '@/hooks/useImageUpload';
import { PageTemplate, TEMPLATE_SPECS, countWords } from '@/lib/pdfTemplates';
import { cn } from '@/lib/utils';

interface ContributorGuidedFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultId: string;
  recipientName: string;
  vaultType: string;
  onCreatePage: (input: CreatePageInput) => Promise<{ error?: Error | null }>;
}

type ContributionType = 'photo_memory' | 'letter' | 'full_photo';

interface ContributionOption {
  id: ContributionType;
  icon: React.ElementType;
  label: string;
  description: string;
  template: PageTemplate;
}

const CONTRIBUTION_OPTIONS: ContributionOption[] = [
  {
    id: 'photo_memory',
    icon: Camera,
    label: 'Photo + Message',
    description: 'Share a photo and write a short reflection',
    template: 'image_reflection',
  },
  {
    id: 'letter',
    icon: FileText,
    label: 'Letter or Story',
    description: 'Write a heartfelt message, story, or letter',
    template: 'story',
  },
  {
    id: 'full_photo',
    icon: Image,
    label: 'Full-Page Photo',
    description: 'A single powerful image with an optional caption',
    template: 'hero_image',
  },
];

const REFLECTION_PROMPTS: Record<string, string[]> = {
  farewell: [
    `What advice would you give to help them on their journey?`,
    `Share a memory that shows their character or strength.`,
    `What are you most excited for them to experience?`,
  ],
  homecoming: [
    `How did they impact your life while they were away?`,
    `What's your favorite memory you have with them?`,
    `What has changed in you because you knew them?`,
  ],
  returned: [
    `What moment do you most want them to remember?`,
    `How have they shaped who you are?`,
    `Share a story that captures the impact they've had on you.`,
  ],
  default: [
    `How has this person impacted your life?`,
    `Share a memory that captures who they are.`,
    `What do you most want them to know?`,
  ],
};

function getPrompts(vaultType: string): string[] {
  return REFLECTION_PROMPTS[vaultType] || REFLECTION_PROMPTS.default;
}

type Step = 'type' | 'content' | 'done';

export function ContributorGuidedFlow({
  open,
  onOpenChange,
  vaultId,
  recipientName,
  vaultType,
  onCreatePage,
}: ContributorGuidedFlowProps) {
  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<ContributionType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { uploadImage, uploading } = useImageUpload();

  const prompts = getPrompts(vaultType);
  const selectedOption = CONTRIBUTION_OPTIONS.find((o) => o.id === selectedType);
  const template = selectedOption?.template ?? 'story';
  const templateSpec = TEMPLATE_SPECS[template];
  const wordCount = countWords(content);
  const isOverLimit = templateSpec.textMaxWords > 0 && wordCount > templateSpec.textMaxWords;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const isContentValid = () => {
    if (!selectedType) return false;
    if (template === 'hero_image' || template === 'image_reflection') {
      if (!imageFile) return false;
    }
    if (template === 'story' || template === 'image_reflection') {
      if (!content.trim()) return false;
    }
    if (isOverLimit) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!isContentValid()) return;
    setSubmitting(true);

    let imageUrl: string | undefined;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) imageUrl = url;
    }

    const result = await onCreatePage({
      vault_id: vaultId,
      title: title || undefined,
      content: template !== 'hero_image' ? content || undefined : undefined,
      image_urls: imageUrl ? [imageUrl] : undefined,
      page_template: template,
      caption: template === 'hero_image' ? caption || undefined : undefined,
    });

    setSubmitting(false);
    if (!result.error) {
      setStep('done');
    }
  };

  const reset = () => {
    setStep('type');
    setSelectedType(null);
    setTitle('');
    setContent('');
    setCaption('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        {step === 'type' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                Add Your Memory
              </DialogTitle>
              <DialogDescription className="text-base">
                How would you like to contribute to {recipientName}'s book?
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-3">
              {CONTRIBUTION_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedType(option.id)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all duration-150',
                      selectedType === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 hover:bg-muted/30'
                    )}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
                    </div>
                    <ChevronRight className={cn('h-4 w-4 transition-opacity', selectedType === option.id ? 'opacity-100 text-primary' : 'opacity-30')} />
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button disabled={!selectedType} onClick={() => setStep('content')}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {step === 'content' && selectedOption && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {selectedOption.label}
              </DialogTitle>
              <DialogDescription>
                {template === 'story'
                  ? `Write a heartfelt message or story for ${recipientName}.`
                  : template === 'image_reflection'
                  ? `Upload a photo and write your reflection for ${recipientName}.`
                  : `Upload a meaningful photo for ${recipientName}'s book.`}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm">Title <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                  id="title"
                  placeholder={`e.g., "A Lesson That Stayed With Me"`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Image upload */}
              {(template === 'hero_image' || template === 'image_reflection') && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Photo <span className="text-destructive">*</span></Label>
                  {imagePreview ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full shadow hover:bg-background transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                      <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click to upload a photo</span>
                      <span className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </label>
                  )}
                </div>
              )}

              {/* Caption (hero only) */}
              {template === 'hero_image' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-sm">Caption <span className="text-muted-foreground">(optional)</span></Label>
                    <span className="text-xs text-muted-foreground">{caption.length}/50</span>
                  </div>
                  <Input
                    placeholder="A short caption for the photo…"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, 50))}
                    maxLength={50}
                  />
                </div>
              )}

              {/* Text content */}
              {(template === 'story' || template === 'image_reflection') && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm">
                      {template === 'story' ? 'Your Message' : 'Your Reflection'}
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <span className={cn('text-xs', isOverLimit ? 'text-destructive' : 'text-muted-foreground')}>
                      {wordCount}/{templateSpec.textMaxWords} words
                    </span>
                  </div>

                  {/* Guiding prompts */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {prompts.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        className="text-xs px-3 py-1.5 bg-primary/8 text-primary border border-primary/20 rounded-full hover:bg-primary/15 transition-colors text-left"
                        onClick={() => setContent(prev => prev ? `${prev}\n\n${prompt} ` : `${prompt} `)}
                      >
                        <Heart className="h-3 w-3 inline mr-1 opacity-70" />
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <Textarea
                    placeholder={
                      template === 'story'
                        ? `Write your letter, story, or message here…`
                        : `Write your heartfelt reflection here…`
                    }
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={template === 'story' ? 10 : 5}
                    className="resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep('type')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isContentValid() || submitting || uploading}
                >
                  {submitting || uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-pulse" />
                      {uploading ? 'Uploading…' : 'Saving…'}
                    </>
                  ) : (
                    'Add to Book'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="font-serif text-2xl mb-3">Memory Added!</h2>
            <p className="text-muted-foreground mb-2">
              Your contribution has been added to {recipientName}'s book.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              The book's owner will review your submission before it's finalized.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={reset}>
                Add Another Memory
              </Button>
              <Button onClick={() => handleClose(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
