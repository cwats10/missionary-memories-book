import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminVault } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface AdminVaultsTabProps {
  vaults: AdminVault[];
  onRefresh: () => void;
}

export const AdminVaultsTab = ({ vaults, onRefresh }: AdminVaultsTabProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVaults = vaults.filter(vault =>
    vault.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vault.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vault.owner_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'farewell':
        return 'outline';
      case 'homecoming':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Vault Overview</h2>
          <p className="text-muted-foreground">View all vaults and their activity across the platform.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vaults, recipients, or owners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Vaults Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No vaults found
                </TableCell>
              </TableRow>
            ) : (
              filteredVaults.map((vault) => (
                <TableRow key={vault.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{vault.title}</TableCell>
                  <TableCell>{vault.recipient_name}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(vault.vault_type)}>
                      {vault.vault_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(vault.status)}>
                      {vault.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">{vault.owner_email}</TableCell>
                  <TableCell className="text-center">{vault.contributor_count}</TableCell>
                  <TableCell className="text-center">{vault.page_count}</TableCell>
                  <TableCell>{format(new Date(vault.created_at), 'MMM d, yyyy')}</TableCell>
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
              ))
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
