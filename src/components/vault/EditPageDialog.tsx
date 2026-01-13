import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Image, X, Upload } from 'lucide-react';
import { Page } from '@/hooks/usePages';
import { useImageUpload } from '@/hooks/useImageUpload';
import { BookSize } from '@/hooks/useVaults';
import { MAX_IMAGES, getCharacterLimits, getBookSizeLabel } from '@/lib/bookSizeLimits';

interface EditPageDialogProps {
  page: Page | null;
  bookSize: BookSize;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (pageId: string, updates: Partial<Page>) => Promise<{ error?: Error | null }>;
}

export function EditPageDialog({ page, bookSize, open, onOpenChange, onSave }: EditPageDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();

  const characterLimits = getCharacterLimits(bookSize);

  // Populate form when page changes
  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        content: page.content || '',
      });
      // Use image_urls if available, otherwise fall back to image_url
      const images = page.image_urls?.length > 0 
        ? page.image_urls 
        : page.image_url 
          ? [page.image_url] 
          : [];
      setExistingImages(images);
      setNewImagePreviews([]);
      setNewImageFiles([]);
    }
  }, [page]);

  const totalImages = existingImages.length + newImageFiles.length;
  const canAddMore = totalImages < MAX_IMAGES;
  const hasImages = totalImages > 0;
  const maxCharacters = hasImages ? characterLimits.withImages : characterLimits.noImages;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - totalImages;
    const filesToAdd = files.slice(0, remainingSlots).filter(file => file.type.startsWith('image/'));

    if (filesToAdd.length === 0) return;

    // Add new files
    setNewImageFiles(prev => [...prev, ...filesToAdd]);

    // Create previews for new files
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;
    
    setLoading(true);

    // Upload new images
    const uploadedUrls: string[] = [];
    for (const file of newImageFiles) {
      const url = await uploadImage(file);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    // Combine existing and new images
    const allImageUrls = [...existingImages, ...uploadedUrls];

    const result = await onSave(page.id, {
      title: formData.title || null,
      content: formData.content || null,
      image_url: allImageUrls[0] || null,
      image_urls: allImageUrls,
    });

    setLoading(false);

    if (!result.error) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Edit Memory</DialogTitle>
            <DialogDescription>
              Update your message, story, or photos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title (optional)</Label>
              <Input
                id="edit-title"
                placeholder="A title for your memory..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            {/* Image Upload */}
            <div className="grid gap-2">
              <Label>Photos (up to {MAX_IMAGES})</Label>
              
              {/* Image previews grid */}
              {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {/* Existing images */}
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="relative aspect-square">
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {/* New image previews */}
                  {newImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`New photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg ring-2 ring-primary"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {canAddMore && (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {totalImages === 0 ? 'Click to upload photos' : 'Add another photo'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalImages}/{MAX_IMAGES} photos • JPG, PNG up to 5MB each
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                multiple
              />
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="edit-content">Your Message</Label>
                <span className={`text-xs ${formData.content.length > maxCharacters ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formData.content.length}/{maxCharacters}
                </span>
              </div>
              <Textarea
                id="edit-content"
                placeholder="Write your heartfelt message here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value.slice(0, maxCharacters) })}
                rows={6}
                maxLength={maxCharacters}
                required
              />
              <p className="text-xs text-muted-foreground">
                {hasImages 
                  ? `Character limit is ${characterLimits.withImages.toLocaleString()} for ${getBookSizeLabel(bookSize)} books with images.`
                  : `You have ${characterLimits.noImages.toLocaleString()} characters for ${getBookSizeLabel(bookSize)} books, reduced to ${characterLimits.withImages.toLocaleString()} with images.`
                }
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading || uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-pulse" />
                  {uploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
