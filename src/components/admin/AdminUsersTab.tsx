import { useState } from 'react';
import { AdminUser } from '@/hooks/useAdmin';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Search, MoreHorizontal, RefreshCw, UserPlus, UserMinus } from 'lucide-react';
import { format } from 'date-fns';

interface AdminUsersTabProps {
  users: AdminUser[];
  onExport: () => void;
  onUpdateRole: (userId: string, role: 'admin' | 'owner' | 'coowner' | 'contributor', action: 'add' | 'remove') => Promise<boolean>;
  onRefresh: () => void;
}

export const AdminUsersTab = ({ users, onExport, onUpdateRole, onRefresh }: AdminUsersTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'owner':
        return 'default';
      case 'coowner':
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
          <h2 className="font-serif text-2xl">User Management</h2>
          <p className="text-muted-foreground">View and manage all users and their contact information.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-center">Vaults</TableHead>
              <TableHead className="text-center">Pages</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.full_name || '—'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant={getRoleBadgeVariant(role)}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{user.vault_count}</TableCell>
                  <TableCell className="text-center">{user.page_count}</TableCell>
                  <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Manage Roles</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {!user.roles.includes('admin') && (
                          <DropdownMenuItem onClick={() => onUpdateRole(user.user_id, 'admin', 'add')}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Admin Role
                          </DropdownMenuItem>
                        )}
                        {user.roles.includes('admin') && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateRole(user.user_id, 'admin', 'remove')}
                            className="text-destructive"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove Admin Role
                          </DropdownMenuItem>
                        )}
                        {!user.roles.includes('owner') && (
                          <DropdownMenuItem onClick={() => onUpdateRole(user.user_id, 'owner', 'add')}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Owner Role
                          </DropdownMenuItem>
                        )}
                        {user.roles.includes('owner') && (
                          <DropdownMenuItem onClick={() => onUpdateRole(user.user_id, 'owner', 'remove')}>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove Owner Role
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </p>
    </div>
  );
};
