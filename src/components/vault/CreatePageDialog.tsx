import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Image, X, Upload, ChevronLeft } from 'lucide-react';
import { CreatePageInput } from '@/hooks/usePages';
import { useImageUpload } from '@/hooks/useImageUpload';
import { TemplateSelector } from './TemplateSelector';
import { TimelineEditor } from './TimelineEditor';
import { PageTemplate, TEMPLATE_SPECS, TimelineEntry, countWords, DEFAULT_TEMPLATE } from '@/lib/pdfTemplates';

interface CreatePageDialogProps {
  vaultId: string;
  vaultType: string;
  recipientName: string;
  onCreatePage: (input: CreatePageInput) => Promise<{ error?: Error | null }>;
  isOwner?: boolean;
}

const getDialogDescription = (vaultType: string, recipientName: string): string => {
  switch (vaultType) {
    case 'farewell':
      return `What message of encouragement or favorite memory or words of advice do you have for ${recipientName}?`;
    case 'homecoming':
      return `How did ${recipientName} impact you while they served around you? Or what is a favorite memory of yours with ${recipientName}?`;
    case 'returned':
      return `What memories, stories, lessons, etc. would you like to be remembered?`;
    default:
      return `Share a message, story, or memory for ${recipientName}.`;
  }
};

export function CreatePageDialog({ vaultId, vaultType, recipientName, onCreatePage, isOwner }: CreatePageDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'template' | 'content'>('template');
  
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate>(DEFAULT_TEMPLATE);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    caption: '',
    hasDropCap: false,
  });
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();

  const templateSpec = TEMPLATE_SPECS[selectedTemplate];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = templateSpec.maxImages - imageFiles.length;
    const filesToAdd = files.slice(0, remainingSlots).filter(file => file.type.startsWith('image/'));

    if (filesToAdd.length === 0) return;

    setImageFiles(prev => [...prev, ...filesToAdd]);

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setStep('template');
    setSelectedTemplate(DEFAULT_TEMPLATE);
    setFormData({ title: '', content: '', caption: '', hasDropCap: false });
    setTimelineData([]);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const imageUrls: string[] = [];
    for (const file of imageFiles) {
      const url = await uploadImage(file);
      if (url) {
        imageUrls.push(url);
      }
    }

    const result = await onCreatePage({
      vault_id: vaultId,
      title: formData.title || undefined,
      content: selectedTemplate === 'timeline' ? undefined : formData.content || undefined,
      image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      page_template: selectedTemplate,
      caption: selectedTemplate === 'hero_image' ? formData.caption || undefined : undefined,
      timeline_data: selectedTemplate === 'timeline' ? timelineData : undefined,
    });

    setLoading(false);

    if (!result.error) {
      setOpen(false);
      resetForm();
    }
  };

  const canAddImage = imageFiles.length < templateSpec.maxImages;
  const wordCount = countWords(formData.content);
  const isOverWordLimit = templateSpec.textMaxWords > 0 && wordCount > templateSpec.textMaxWords;

  // Validation
  const isValid = () => {
    if (templateSpec.imageRequired && imageFiles.length === 0) return false;
    if (selectedTemplate === 'timeline' && timelineData.length === 0) return false;
    if (selectedTemplate === 'story' && !formData.content.trim()) return false;
    if (selectedTemplate === 'image_reflection' && !formData.content.trim()) return false;
    if (isOverWordLimit) return false;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Page
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {step === 'template' ? 'Choose a Layout' : 'Add a Memory'}
            </DialogTitle>
            <DialogDescription>
              {step === 'template' 
                ? 'Select a page template that best fits your content.'
                : getDialogDescription(vaultType, recipientName)
              }
            </DialogDescription>
          </DialogHeader>

          {step === 'template' ? (
            // Step 1: Template Selection
            <div className="py-6">
              <TemplateSelector
                value={selectedTemplate}
                onChange={setSelectedTemplate}
              />
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setStep('content')}>
                  Continue
                </Button>
              </DialogFooter>
            </div>
          ) : (
            // Step 2: Content Entry
            <div className="py-6">
              {/* Back button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-4 -ml-2 gap-1"
                onClick={() => setStep('template')}
              >
                <ChevronLeft className="h-4 w-4" />
                Change Layout
              </Button>

              <div className="grid gap-4">
                {/* Title field - always shown */}
                <div className="grid gap-2">
                  <Label htmlFor="title">
                    Title {selectedTemplate === 'timeline' ? '' : '(optional)'}
                  </Label>
                  <Input
                    id="title"
                    placeholder={selectedTemplate === 'timeline' ? 'e.g., Transfers & Companions' : 'A title for your memory...'}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required={selectedTemplate === 'timeline'}
                  />
                </div>

                {/* Image Upload - for hero_image and image_reflection */}
                {templateSpec.maxImages > 0 && (
                  <div className="grid gap-2">
                    <Label>
                      Photo {templateSpec.imageRequired && <span className="text-destructive">*</span>}
                    </Label>
                    
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {canAddImage && (
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Image className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {imagePreviews.length === 0 ? 'Click to upload a photo' : 'Change photo'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG up to 5MB
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>
                )}

                {/* Caption field - hero_image only */}
                {selectedTemplate === 'hero_image' && (
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="caption">Caption (optional)</Label>
                      <span className="text-xs text-muted-foreground">
                        {formData.caption.length}/{templateSpec.captionMaxChars}
                      </span>
                    </div>
                    <Input
                      id="caption"
                      placeholder="Small caption at bottom of image..."
                      value={formData.caption}
                      onChange={(e) => setFormData({ ...formData, caption: e.target.value.slice(0, templateSpec.captionMaxChars) })}
                      maxLength={templateSpec.captionMaxChars}
                    />
                  </div>
                )}

                {/* Text content - image_reflection and story */}
                {(selectedTemplate === 'image_reflection' || selectedTemplate === 'story') && (
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="content">
                        {selectedTemplate === 'story' ? 'Your Story' : 'Reflection'}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <span className={`text-xs ${isOverWordLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {wordCount}/{templateSpec.textMaxWords} words
                      </span>
                    </div>
                    <Textarea
                      id="content"
                      placeholder={selectedTemplate === 'story' 
                        ? 'Write your story, letter, or reflection...' 
                        : 'Write your heartfelt message here...'
                      }
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={selectedTemplate === 'story' ? 10 : 6}
                      required
                    />
                    {selectedTemplate === 'story' && (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="drop-cap"
                          checked={formData.hasDropCap}
                          onCheckedChange={(checked) => setFormData({ ...formData, hasDropCap: checked })}
                        />
                        <Label htmlFor="drop-cap" className="text-sm text-muted-foreground cursor-pointer">
                          Use decorative drop cap
                        </Label>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline editor */}
                {selectedTemplate === 'timeline' && (
                  <TimelineEditor
                    value={timelineData}
                    onChange={setTimelineData}
                    maxEntries={20}
                  />
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || uploading || !isValid()}>
                  {loading || uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-pulse" />
                      {uploading ? 'Uploading...' : 'Adding...'}
                    </>
                  ) : (
                    'Add Memory'
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
