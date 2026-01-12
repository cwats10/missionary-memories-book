import { VaultWithRole, VaultType } from '@/hooks/useVaults';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { brandConfig } from '@/config/brandConfig';
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
  vault: VaultWithRole;
  onDelete?: (id: string) => Promise<void>;
  onView: (id: string) => void;
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

const getVaultTypeName = (vaultType: VaultType) => {
  switch (vaultType) {
    case 'farewell':
      return 'Farewell Vault';
    case 'homecoming':
      return 'Homecoming Vault';
    case 'returned':
      return 'Returned Missionary Vault';
  }
};

export function VaultCard({ vault, onDelete, onView }: VaultCardProps) {
  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    published: 'bg-primary/10 text-primary',
    printed: 'bg-accent text-accent-foreground',
  };

  const coverColors = getCoverColors(vault.vault_type);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <Card className="group hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex">
        {/* Book cover preview */}
        <div
          className="w-28 flex-shrink-0 flex flex-col items-center justify-center p-4"
          style={{ backgroundColor: coverColors.bg }}
        >
          <span
            className="text-[8px] font-serif text-center leading-tight"
            style={{ color: coverColors.text }}
          >
            Mission Memory Vault
          </span>
        </div>

        {/* Card content */}
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-serif text-lg text-foreground">{vault.recipient_name}</h3>
              <p className="text-sm text-muted-foreground">{vault.mission_name}</p>
            </div>
            <Badge className={statusColors[vault.status] || statusColors.draft}>
              {vault.status.charAt(0).toUpperCase() + vault.status.slice(1)}
            </Badge>
          </div>

          {(vault.service_start_date || vault.service_end_date) && (
            <p className="text-xs text-muted-foreground mb-2">
              {formatDate(vault.service_start_date)} — {formatDate(vault.service_end_date)}
            </p>
          )}

          <p className="text-xs text-muted-foreground/70 mb-3">
            {getVaultTypeName(vault.vault_type)}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Created {formatDistanceToNow(new Date(vault.created_at), { addSuffix: true })}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onView(vault.id)}>
                <Eye className="h-3.5 w-3.5" />
                Manage
              </Button>
              {onDelete && (
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
                        This will permanently delete this vault for {vault.recipient_name} and all its pages. This action cannot be undone.
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
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
