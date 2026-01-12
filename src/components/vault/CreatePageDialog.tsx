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
import { Plus, Image, X, Upload } from 'lucide-react';
import { CreatePageInput } from '@/hooks/usePages';
import { useImageUpload } from '@/hooks/useImageUpload';

interface CreatePageDialogProps {
  vaultId: string;
  vaultType: string;
  recipientName: string;
  onCreatePage: (input: CreatePageInput) => Promise<{ error?: Error | null }>;
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

const MAX_IMAGES = 3;
const MAX_CHARACTERS_NO_IMAGES = 1700;
const MAX_CHARACTERS_WITH_IMAGES = 750;

export function CreatePageDialog({ vaultId, vaultType, recipientName, onCreatePage }: CreatePageDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - imageFiles.length;
    const filesToAdd = files.slice(0, remainingSlots).filter(file => file.type.startsWith('image/'));

    if (filesToAdd.length === 0) return;

    // Add new files
    setImageFiles(prev => [...prev, ...filesToAdd]);

    // Create previews for new files
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const imageUrls: string[] = [];

    // Upload all images
    for (const file of imageFiles) {
      const url = await uploadImage(file);
      if (url) {
        imageUrls.push(url);
      }
    }

    const result = await onCreatePage({
      vault_id: vaultId,
      title: formData.title || undefined,
      content: formData.content || undefined,
      image_urls: imageUrls.length > 0 ? imageUrls : undefined,
    });

    setLoading(false);

    if (!result.error) {
      setOpen(false);
      setFormData({ title: '', content: '' });
      setImageFiles([]);
      setImagePreviews([]);
    }
  };

  const canAddMore = imageFiles.length < MAX_IMAGES;
  const hasImages = imageFiles.length > 0;
  const maxCharacters = hasImages ? MAX_CHARACTERS_WITH_IMAGES : MAX_CHARACTERS_NO_IMAGES;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Page
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Add a Memory</DialogTitle>
            <DialogDescription>
              {getDialogDescription(vaultType, recipientName)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="A title for your memory..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            {/* Image Upload */}
            <div className="grid gap-2">
              <Label>Photos (up to {MAX_IMAGES})</Label>
              
              {/* Image previews grid */}
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

              {/* Upload button */}
              {canAddMore && (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {imagePreviews.length === 0 ? 'Click to upload photos' : 'Add another photo'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {imagePreviews.length}/{MAX_IMAGES} photos • JPG, PNG up to 5MB each
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
                <Label htmlFor="content">Your Message</Label>
                <span className={`text-xs ${formData.content.length > maxCharacters ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formData.content.length}/{maxCharacters}
                </span>
              </div>
              <Textarea
                id="content"
                placeholder="Write your heartfelt message here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value.slice(0, maxCharacters) })}
                rows={6}
                maxLength={maxCharacters}
                required
              />
              <p className="text-xs text-muted-foreground">
                {hasImages 
                  ? `Character limit reduced to ${MAX_CHARACTERS_WITH_IMAGES} when images are added.`
                  : `You have a ${MAX_CHARACTERS_NO_IMAGES} character limit, but adding images reduces it to ${MAX_CHARACTERS_WITH_IMAGES}.`
                }
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
