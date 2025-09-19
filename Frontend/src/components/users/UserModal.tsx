import React, { useState } from 'react';
import { 
  Mail,
  User,
  Shield,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/contexts/AuthContext';

interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  lastLogin?: string;
  createdAt?: string;
  projectsCount?: number;
}

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: (user: User) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  open,
  onOpenChange,
  user,
  onSave
}) => {
  const { toast } = useToast();
  const isEditing = !!user;
  
  const [formData, setFormData] = useState<User>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    status: user?.status || 'active',
    avatar: user?.avatar,
    lastLogin: user?.lastLogin,
    createdAt: user?.createdAt,
    projectsCount: user?.projectsCount || 0
  });

  const handleChange = (field: keyof User) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom est requis',
        variant: 'destructive'
      });
      return;
    }
    
    if (!formData.email.trim()) {
      toast({
        title: 'Erreur',
        description: 'L\'email est requis',
        variant: 'destructive'
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Erreur',
        description: 'Format d\'email invalide',
        variant: 'destructive'
      });
      return;
    }

    const userToSave = {
      ...formData,
      id: user?.id || Date.now().toString(),
      avatar: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
      createdAt: formData.createdAt || new Date().toISOString(),
      lastLogin: formData.lastLogin || '',
      projectsCount: formData.projectsCount || 0
    };
    
    onSave(userToSave);
    onOpenChange(false);
    
    toast({
      title: isEditing ? 'Utilisateur modifié' : 'Utilisateur créé',
      description: `L'utilisateur "${formData.name}" a été ${isEditing ? 'modifié' : 'créé'} avec succès`
    });

    // Reset form if creating new user
    if (!isEditing) {
      setFormData({
        name: '',
        email: '',
        role: 'user',
        status: 'active',
        projectsCount: 0
      });
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'manager': return 'bg-warning text-warning-foreground';
      case 'user': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Accès complet à toutes les fonctionnalités, gestion des utilisateurs et projets';
      case 'manager':
        return 'Gestion des projets, visualisation des données d\'équipe, pas d\'accès aux utilisateurs';
      case 'user':
        return 'Accès limité aux projets personnels, aucune fonction d\'administration';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifiez les informations de l\'utilisateur ci-dessous'
              : 'Remplissez les informations pour créer un nouvel utilisateur'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom complet *
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange('name')(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Adresse email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email')(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Rôle *
            </Label>
            <Select value={formData.role} onValueChange={handleChange('role')}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(formData.role)} variant="secondary">
                    {formData.role.toUpperCase()}
                  </Badge>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User - Utilisateur standard</SelectItem>
                <SelectItem value="manager">Manager - Gestionnaire de projets</SelectItem>
                <SelectItem value="admin">Admin - Administrateur système</SelectItem>
              </SelectContent>
            </Select>
            
            {formData.role && (
              <div className="p-3 bg-info-light border border-info/20 rounded-lg">
                <p className="text-sm text-info">
                  <strong>{formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}:</strong> {getRoleDescription(formData.role)}
                </p>
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={formData.status} onValueChange={handleChange('status')}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(formData.status)} variant="secondary">
                    {formData.status === 'active' && 'Actif'}
                    {formData.status === 'inactive' && 'Inactif'}
                    {formData.status === 'pending' && 'En attente'}
                  </Badge>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warning for admin role */}
          {formData.role === 'admin' && (
            <div className="flex items-center gap-2 p-3 bg-warning-light border border-warning/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-sm text-warning">
                <strong>Attention:</strong> Ce rôle donne un accès complet à toutes les fonctionnalités de l'application.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Modifier' : 'Créer l\'utilisateur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};