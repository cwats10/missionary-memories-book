import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminVault } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { brandConfig } from '@/config/brandConfig';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RefreshCw, ExternalLink, Gem, HandHeart } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AdminVaultsTabProps {
  vaults: AdminVault[];
  onRefresh: () => void;
  onUpdateVaultStatus?: (vaultId: string, status: string) => Promise<boolean>;
}

type StatusFilter = 'all' | 'draft' | 'purchased' | 'submitted' | 'in_production' | 'shipped';

const FULFILLMENT_STATUSES: { value: string; label: string; group?: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'purchased', label: 'Active (Standard)' },
  { value: 'purchased_heirloom', label: 'Active (Heirloom)' },
  { value: 'submitted', label: 'Submitted → Prodigi' },
  { value: 'submitted_heirloom', label: 'Submitted → Printique ⚑' },
  { value: 'in_production', label: 'In Production' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered (Heirloom)' },
];

const STATUS_FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'purchased', label: 'Active' },
  { key: 'submitted', label: 'Prodigi Queue' },
  { key: 'in_production', label: 'Printing' },
  { key: 'shipped', label: 'Shipped' },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'draft':
      return { label: 'Draft', className: 'bg-muted text-muted-foreground' };
    case 'purchased':
      return { label: 'Active', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    case 'purchased_heirloom':
      return { label: 'Active · Heirloom', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' };
    case 'submitted':
      return { label: 'Prodigi Queue', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' };
    case 'submitted_heirloom':
      return { label: '⚑ Printique Queue', className: 'bg-gold/20 text-amber-800 dark:text-amber-300 border border-gold/30' };
    case 'in_production':
      return { label: 'In Production', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
    case 'shipped':
      return { label: 'Shipped', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    case 'delivered':
      return { label: 'Delivered ✓', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' };
    default:
      return { label: status, className: 'bg-muted text-muted-foreground' };
  }
}

export const AdminVaultsTab = ({ vaults, onRefresh, onUpdateVaultStatus }: AdminVaultsTabProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredVaults = vaults.filter((vault) => {
    const matchesSearch =
      vault.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vault.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vault.owner_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vault.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countByStatus = (s: StatusFilter) =>
    s === 'all' ? vaults.length : vaults.filter((v) => v.status === s).length;

  const handleStatusChange = async (vaultId: string, newStatus: string) => {
    if (!onUpdateVaultStatus) return;
    setUpdatingId(vaultId);
    await onUpdateVaultStatus(vaultId, newStatus);
    setUpdatingId(null);
  };

  // Pipeline counts for the summary row — group purchased+purchased_heirloom, submitted+submitted_heirloom
  const pipeline = ['draft', 'purchased', 'submitted', 'in_production', 'shipped'];
  const pipelineCounts = pipeline.map((s) => ({
    status: s,
    badge: getStatusBadge(s),
    count: s === 'purchased'
      ? vaults.filter(v => v.status === 'purchased' || v.status === 'purchased_heirloom').length
      : s === 'submitted'
        ? vaults.filter(v => v.status === 'submitted' || v.status === 'submitted_heirloom').length
        : vaults.filter(v => v.status === s).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Vault Fulfillment</h2>
          <p className="text-muted-foreground text-sm">
            Track orders through the production pipeline and update fulfillment status.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* ⚑ Heirloom Action Queue */}
      {(() => {
        const heirloomQueue = vaults.filter(v => v.status === 'submitted_heirloom');
        if (!heirloomQueue.length) return null;
        return (
          <div className="rounded-xl border-2 border-gold/30 bg-gold/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Gem className="h-4 w-4 text-gold" />
              <h3 className="font-serif text-base tracking-wide">
                Heirloom Queue — Manual Action Required
              </h3>
              <span className="text-xs px-2 py-0.5 bg-gold/20 text-amber-800 rounded-full border border-gold/30">
                {heirloomQueue.length} pending
              </span>
            </div>
            <p className="font-serif-text text-xs text-muted-foreground">
              These orders require you to manually place a Printique order, then hand-deliver the finished book.
              Download the PDF → order on{' '}
              <a href={brandConfig.printique.website} target="_blank" rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors">
                printique.com
              </a>{' '}
              → mark as In Production when ordered → mark as Delivered when handed off.
            </p>
            <div className="space-y-2">
              {heirloomQueue.map(vault => (
                <div key={vault.id} className="flex items-center justify-between gap-4 p-3 bg-background/60 rounded-lg border border-gold/20">
                  <div className="flex-1 min-w-0">
                    <p className="font-serif-text text-sm font-medium truncate">{vault.recipient_name}</p>
                    <p className="font-serif-text text-xs text-muted-foreground truncate">{vault.owner_email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs h-7 border-gold/30 hover:border-gold/60"
                      onClick={() => navigate(`/vault/${vault.id}`)}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open Vault
                    </Button>
                    {onUpdateVaultStatus && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs h-7"
                        onClick={() => onUpdateVaultStatus(vault.id, 'in_production')}
                        disabled={updatingId === vault.id}
                      >
                        <HandHeart className="h-3 w-3" />
                        Mark Ordered
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Fulfillment pipeline summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {pipelineCounts.map(({ status, badge, count }) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status as StatusFilter)}
            className={cn(
              'p-3 rounded-lg border text-left transition-all',
              statusFilter === status
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-muted-foreground/40'
            )}
          >
            <span className={cn('inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2', badge.className)}>
              {badge.label}
            </span>
            <p className="font-serif text-2xl">{count}</p>
          </button>
        ))}
      </div>

      {/* Search + filter row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vaults, recipients, or owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 flex-shrink-0">
          {STATUS_FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                statusFilter === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px]">({countByStatus(tab.key)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vaults Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Fulfillment Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-center">Contributors</TableHead>
              <TableHead className="text-center">Pages</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVaults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No vaults found
                </TableCell>
              </TableRow>
            ) : (
              filteredVaults.map((vault) => {
                const { label, className } = getStatusBadge(vault.status);
                return (
                  <TableRow key={vault.id}>
                    <TableCell className="font-medium max-w-[180px] truncate">
                      {vault.recipient_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {vault.vault_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {onUpdateVaultStatus ? (
                        <Select
                          value={vault.status}
                          onValueChange={(val) => handleStatusChange(vault.id, val)}
                          disabled={updatingId === vault.id}
                        >
                          <SelectTrigger className="h-7 text-xs w-36">
                            <SelectValue>
                              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', className)}>
                                {label}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {FULFILLMENT_STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value} className="text-xs">
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', className)}>
                          {label}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm">{vault.owner_email}</TableCell>
                    <TableCell className="text-center">{vault.contributor_count}</TableCell>
                    <TableCell className="text-center">{vault.page_count}</TableCell>
                    <TableCell className="text-sm">{format(new Date(vault.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/vault/${vault.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredVaults.length} of {vaults.length} vaults
      </p>
    </div>
  );
};
