import { VaultWithRole, VaultType } from '@/hooks/useVaults';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
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
    published: 'bg-gold/15 text-gold',
    printed: 'bg-accent text-accent-foreground',
  };

  const coverColors = getCoverColors(vault.vault_type);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <Card className="group shadow-elegant hover:shadow-elegant-lg transition-all duration-500 overflow-hidden border-stone/15 hover:border-gold/30 hover:-translate-y-1">
      <div className="flex">
        {/* Book cover preview with emboss effect */}
        <div
          className="w-28 flex-shrink-0 flex flex-col items-center justify-center p-4 shadow-emboss"
          style={{ backgroundColor: coverColors.bg }}
        >
          <span
            className="text-[8px] font-serif text-center leading-tight tracking-wide"
            style={{ color: coverColors.text }}
          >
            Mission Memory Vault
          </span>
        </div>

        {/* Card content */}
        <CardContent className="flex-1 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-serif text-lg text-foreground tracking-wide">{vault.recipient_name}</h3>
              <p className="text-sm font-serif-text text-muted-foreground">{vault.mission_name}</p>
            </div>
            <Badge className={`${statusColors[vault.status] || statusColors.draft} font-serif-text text-xs`}>
              {vault.status.charAt(0).toUpperCase() + vault.status.slice(1)}
            </Badge>
          </div>

          {(vault.service_start_date || vault.service_end_date) && (
            <p className="text-xs font-serif-text text-muted-foreground mb-2">
              {formatDate(vault.service_start_date)} — {formatDate(vault.service_end_date)}
            </p>
          )}

          <p className="text-xs font-serif-text text-muted-foreground/60 mb-4">
            {getVaultTypeName(vault.vault_type)}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-stone/15">
            <span className="text-xs font-serif-text text-muted-foreground">
              Created {formatDistanceToNow(new Date(vault.created_at), { addSuffix: true })}
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="hover:opacity-90 shadow-elegant hover:shadow-elegant-lg transition-all duration-300"
                style={{ 
                  backgroundColor: brandConfig.colors.deepForest.hex,
                  color: brandConfig.colors.boneParchment.hex 
                }}
                onClick={() => onView(vault.id)}
              >
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
                  <AlertDialogContent className="border-stone/20 shadow-elegant-xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-serif tracking-wide">Delete this vault?</AlertDialogTitle>
                      <AlertDialogDescription className="font-serif-text">
                        This will permanently delete this vault for {vault.recipient_name} and all its pages. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-stone/30">Cancel</AlertDialogCancel>
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
