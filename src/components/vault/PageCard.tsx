import { Page } from '@/hooks/usePages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Trash2, Edit, Send, User, Image, Layout, FileText, List } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TEMPLATE_SPECS, PageTemplate } from '@/lib/pdfTemplates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const TEMPLATE_ICONS: Record<PageTemplate, React.ElementType> = {
  hero_image: Image,
  image_reflection: Layout,
  story: FileText,
  timeline: List,
};

interface PageCardProps {
  page: Page;
  pageNumber: number;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (page: Page) => void;
  onApprove?: (id: string) => Promise<{ error: unknown }>;
  onReject?: (id: string) => Promise<{ error: unknown }>;
  onUnapprove?: (id: string) => Promise<{ error: unknown }>;
  onSubmit?: (id: string) => Promise<{ error: unknown }>;
  isOwner?: boolean;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function PageCard({
  page,
  pageNumber,
  onDelete,
  onEdit,
  onApprove,
  onUnapprove,
  onSubmit,
  isOwner,
  isDragging,
  dragHandleProps,
}: PageCardProps) {
  const isApproved = page.status === 'approved';

  const handleToggleApproval = async () => {
    if (isApproved) {
      // Switch from approved to draft
      onUnapprove?.(page.id);
    } else {
      // Switch from draft/submitted to approved
      onApprove?.(page.id);
    }
  };

  return (
    <Card
      className={`group hover:shadow-md transition-shadow overflow-hidden ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
    >
      <CardContent className="p-0">
        <div className="flex">
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="flex-shrink-0 w-8 flex items-center justify-center bg-muted/30 cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Image thumbnails */}
          {(page.image_urls?.length > 0 || page.image_url) && (
            <div className="flex-shrink-0 flex">
              {(page.image_urls?.length > 0 ? page.image_urls : [page.image_url]).slice(0, 3).map((url, index) => (
                <div 
                  key={index} 
                  className={`w-24 h-32 ${index > 0 ? '-ml-2' : ''}`}
                  style={{ zIndex: 3 - index }}
                >
                  <img 
                    src={url!} 
                    alt="" 
                    className="w-full h-full object-cover border-2 border-background shadow-sm"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
                <span className="font-serif text-primary font-medium">{pageNumber}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">{page.title || 'Untitled Memory'}</h3>
                      {/* Template indicator */}
                      {(() => {
                        const template = page.page_template || 'image_reflection';
                        const TemplateIcon = TEMPLATE_ICONS[template];
                        const spec = TEMPLATE_SPECS[template];
                        return (
                          <span 
                            className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                            title={spec.name}
                          >
                            <TemplateIcon className="h-3 w-3" />
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {page.contributor_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {page.contributor_name}
                        </span>
                      )}
                      <span>•</span>
                      <span>Added {formatDistanceToNow(new Date(page.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Approval Toggle for owners/managers */}
                  {isOwner && onApprove && onUnapprove ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium transition-colors ${
                          isApproved ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
                        }`}
                      >
                        {isApproved ? 'Approved' : 'Draft'}
                      </span>
                      <Switch
                        checked={isApproved}
                        onCheckedChange={handleToggleApproval}
                        className="data-[state=checked]:bg-green-600"
                      />
                    </div>
                  ) : (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        isApproved
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                    </span>
                  )}
                </div>
                {page.content && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{page.content}</p>
                )}
                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  {/* Contributor submit button */}
                  {!isOwner && page.status === 'draft' && onSubmit && (
                    <Button variant="default" size="sm" className="gap-1.5" onClick={() => onSubmit(page.id)}>
                      <Send className="h-3.5 w-3.5" />
                      Submit for Review
                    </Button>
                  )}

                  {onEdit && (
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => onEdit(page)}>
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this page?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this memory. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(page.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
