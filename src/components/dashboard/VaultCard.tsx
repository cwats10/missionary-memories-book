import { Vault } from '@/hooks/useVaults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, Users, Trash2, Eye } from 'lucide-react';
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

interface VaultCardProps {
  vault: Vault;
  onDelete: (id: string) => Promise<void>;
  onView: (id: string) => void;
}

export function VaultCard({ vault, onDelete, onView }: VaultCardProps) {
  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    published: 'bg-primary/10 text-primary',
    printed: 'bg-accent text-accent-foreground',
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/5 rounded-lg">
              <Book className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-serif text-lg">{vault.title}</CardTitle>
              <CardDescription>For {vault.recipient_name}</CardDescription>
            </div>
          </div>
          <Badge className={statusColors[vault.status] || statusColors.draft}>
            {vault.status.charAt(0).toUpperCase() + vault.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {vault.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {vault.description}
          </p>
        )}
        {vault.occasion && (
          <p className="text-xs text-muted-foreground mb-4">
            Occasion: {vault.occasion}
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Created {formatDistanceToNow(new Date(vault.created_at), { addSuffix: true })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onView(vault.id)}
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
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
                  <AlertDialogTitle>Delete this vault?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{vault.title}" and all its pages. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(vault.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
