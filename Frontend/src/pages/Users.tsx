import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserModal } from '@/components/users/UserModal';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
  projectsCount: number;
}

// Données de démonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie.dubois@example.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
    status: 'active',
    lastLogin: '2024-09-18T10:30:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    projectsCount: 5,
  },
  {
    id: '2',
    name: 'Jean Martin',
    email: 'jean.martin@example.com',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jean',
    status: 'active',
    lastLogin: '2024-09-17T15:45:00Z',
    createdAt: '2024-02-01T10:30:00Z',
    projectsCount: 3,
  },
  {
    id: '3',
    name: 'Sophie Leroy',
    email: 'sophie.leroy@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie',
    status: 'active',
    lastLogin: '2024-09-18T08:15:00Z',
    createdAt: '2024-03-10T14:20:00Z',
    projectsCount: 2,
  },
  {
    id: '4',
    name: 'Pierre Durand',
    email: 'pierre.durand@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pierre',
    status: 'inactive',
    lastLogin: '2024-09-10T12:00:00Z',
    createdAt: '2024-04-05T11:45:00Z',
    projectsCount: 1,
  },
  {
    id: '5',
    name: 'Anna Moreau',
    email: 'anna.moreau@example.com',
    role: 'user',
    status: 'pending',
    lastLogin: '',
    createdAt: '2024-09-15T16:30:00Z',
    projectsCount: 0,
  },
];

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Vérifier si l'utilisateur actuel peut accéder à cette page
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-destructive-light rounded-full flex items-center justify-center mx-auto">
            <UserX className="w-12 h-12 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Accès interdit</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-destructive text-destructive-foreground">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-warning text-warning-foreground">Manager</Badge>;
      case 'user':
        return <Badge className="bg-success text-success-foreground">User</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Actif</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEdit = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
      setIsUserModalOpen(true);
    }
  };

  const handleDelete = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({
      title: 'Utilisateur supprimé',
      description: `L'utilisateur a été supprimé avec succès`,
      variant: 'destructive',
    });
  };

  const handleSendEmail = (email: string) => {
    toast({
      title: 'Email envoyé',
      description: `Un email a été envoyé à ${email}`,
    });
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, status: newStatus as User['status'] } : user
    ));
    toast({
      title: 'Statut modifié',
      description: `L'utilisateur est maintenant ${newStatus === 'active' ? 'actif' : 'inactif'}`,
    });
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (userData: User) => {
    if (editingUser) {
      // Modifier un utilisateur existant
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...userData }
          : user
      ));
    } else {
      // Créer un nouvel utilisateur
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
        createdAt: new Date().toISOString(),
        lastLogin: '',
        projectsCount: 0,
      };
      setUsers(prev => [newUser, ...prev]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les utilisateurs et leurs permissions
          </p>
        </div>
        <Button onClick={handleCreateUser} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-1 gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-card-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Projets</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(user.status)}
                </TableCell>
                <TableCell>
                  <span className="text-foreground font-medium">{user.projectsCount}</span>
                </TableCell>
                <TableCell>
                  {user.lastLogin ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(user.lastLogin).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Jamais</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleSendEmail(user.email)}>
                        <Mail className="w-4 h-4 mr-2" />
                        Envoyer un email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
                        {user.status === 'active' ? (
                          <>
                            <UserX className="w-4 h-4 mr-2" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activer
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par inviter votre premier utilisateur'
            }
          </p>
          <Button onClick={handleCreateUser}>
            <Plus className="w-4 h-4 mr-2" />
            Inviter un utilisateur
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-foreground">{users.length}</div>
          <div className="text-sm text-muted-foreground">Total utilisateurs</div>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-success">{users.filter(u => u.status === 'active').length}</div>
          <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-warning">{users.filter(u => u.status === 'pending').length}</div>
          <div className="text-sm text-muted-foreground">En attente</div>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{users.filter(u => u.role === 'admin').length}</div>
          <div className="text-sm text-muted-foreground">Administrateurs</div>
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        open={isUserModalOpen}
        onOpenChange={setIsUserModalOpen}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};