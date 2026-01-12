import { Page } from '@/hooks/usePages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Trash2, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

interface PageCardProps {
  page: Page;
  pageNumber: number;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (page: Page) => void;
}

export function PageCard({ page, pageNumber, onDelete, onEdit }: PageCardProps) {
  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    submitted: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
  };

  return (
    <Card className="group hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Image thumbnail */}
          {page.image_url && (
            <div className="flex-shrink-0 w-32 h-32">
              <img
                src={page.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
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
                    <h3 className="font-medium text-foreground truncate">
                      {page.title || 'Untitled Memory'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Added {formatDistanceToNow(new Date(page.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className={statusColors[page.status] || statusColors.draft}>
                    {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                  </Badge>
                </div>
                {page.content && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {page.content}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => onEdit(page)}
                    >
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
