import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Users,
  AlertTriangle,
  X
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { safeFetch } from '@/contexts/AuthContext';
import { getCsrfCookie } from '@/contexts/AuthContext';

interface Project {
  id?: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  dueDate: string;
  team: string[];
}

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSave: (project: Project) => void;
}

// Team members will be fetched from backend

export const ProjectModal: React.FC<ProjectModalProps> = ({
  open,
  onOpenChange,
  project,
  onSave
}) => {
  const { toast } = useToast();
  const isEditing = !!project;

  const [formData, setFormData] = useState<Project>({
    title: '',
    description: '',
    status: 'active',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    team: []
  });

  // Update formData when editing a project
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'active',
        priority: project.priority || 'medium',
        startDate: project.startDate || '',
        dueDate: project.dueDate || '',
        team: project.team || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'active',
        priority: 'medium',
        startDate: '',
        dueDate: '',
        team: []
      });
    }
  }, [project, open]);

  const [selectedMember, setSelectedMember] = useState<string>('');
  const [users, setUsers] = useState<{id: string, name: string, email: string}[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingUsers(true);
      fetch('/api/users', { credentials: 'include', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data?.data)) {
            setUsers(data.data.map(u => ({ id: String(u.id), name: u.name || u.email, email: u.email })));
          } else {
            setUsers([]);
          }
        })
        .catch(() => setUsers([]))
        .finally(() => setLoadingUsers(false));
    }
  }, [open]);

  const handleChange = (field: keyof Project) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTeamMember = () => {
    // selectedMember is email, find user ID
    const user = users.find(u => u.email === selectedMember);
    if (user && !formData.team.includes(user.id)) {
      setFormData(prev => ({
        ...prev,
        team: [...prev.team, user.id]
      }));
      setSelectedMember('');
    }
  };

  const removeTeamMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(m => m !== member)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le titre du projet est requis',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.dueDate) {
      toast({
        title: 'Erreur',
        description: 'La date d\'échéance est requise',
        variant: 'destructive'
      });
      return;
    }

    let url = '/api/projects';
    let method = 'POST';
    let payload: any = {};
    if (isEditing && project?.id) {
      url = `/api/projects/${project.id}`;
      method = 'PUT';
      payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        team: formData.team,
        start_date: formData.startDate,
        end_date: formData.dueDate
      };
      // Remove camelCase fields
      delete payload.startDate;
      delete payload.dueDate;
    } else {
      payload = {
        ...formData,
        start_date: formData.startDate,
        end_date: formData.dueDate
      };
      // Remove startDate and dueDate from payload
      delete payload.startDate;
      delete payload.dueDate;
    }

    try {
      await getCsrfCookie();
      const res = await safeFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      if (!res || !res.ok) {
        const errorText = res ? await res.text() : '';
        toast({
          title: 'Erreur',
          description: errorText || 'Erreur lors de la sauvegarde du projet',
          variant: 'destructive'
        });
        return;
      }
      onSave(await res.json());
      onOpenChange(false);
      toast({
        title: isEditing ? 'Projet modifié' : 'Projet créé',
        description: `Le projet "${formData.title}" a été ${isEditing ? 'modifié' : 'créé'} avec succès`
      });
      if (!isEditing) {
        setFormData({
          title: '',
          description: '',
          status: 'active',
          priority: 'medium',
          startDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          team: []
        });
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le projet',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'completed': return 'bg-info text-info-foreground';
      case 'on-hold': return 'bg-warning text-warning-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Modifier le projet' : 'Créer un nouveau projet'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifiez les informations du projet ci-dessous'
              : 'Remplissez les informations pour créer un nouveau projet'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Titre du projet *</Label>
              <Input
                id="title"
                placeholder="Nom du projet"
                value={formData.title}
                onChange={(e) => handleChange('title')(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez le projet..."
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description')(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate')(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Date d'échéance *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate')(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={handleChange('status')}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(formData.status)} variant="secondary">
                      {formData.status === 'active' && 'Actif'}
                      {formData.status === 'completed' && 'Terminé'} 
                      {formData.status === 'on-hold' && 'En attente'}
                      {formData.status === 'cancelled' && 'Annulé'}
                    </Badge>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="on-hold">En attente</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={formData.priority} onValueChange={handleChange('priority')}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(formData.priority)} variant="secondary">
                      {formData.priority === 'high' && 'Haute'}
                      {formData.priority === 'medium' && 'Moyenne'}
                      {formData.priority === 'low' && 'Basse'}
                    </Badge>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-2 md:col-span-2">
            <Label>Membres de l'équipe</Label>
            <div className="flex gap-2 items-center">
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={loadingUsers ? "Chargement..." : "Ajouter un membre"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.email} value={user.email}>{user.name} ({user.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="secondary" onClick={addTeamMember} disabled={!selectedMember || loadingUsers}>
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.team.map(memberId => {
                const user = users.find(u => u.id === memberId);
                return (
                  <Badge key={memberId} className="flex items-center gap-1">
                    {user ? `${user.name} (${user.email})` : memberId}
                    <button type="button" onClick={() => removeTeamMember(memberId)} className="ml-1 text-xs text-destructive"><X size={14} /></button>
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Warning for dates */}
          {formData.startDate && formData.dueDate && new Date(formData.startDate) > new Date(formData.dueDate) && (
            <div className="flex items-center gap-2 p-3 bg-warning-light border border-warning/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-sm text-warning">
                La date de début ne peut pas être postérieure à la date d'échéance
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
              {isEditing ? 'Modifier' : 'Créer le projet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};