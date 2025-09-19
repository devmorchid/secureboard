import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Task } from '@/pages/Tasks';

interface TaskSaveEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export function TaskSaveEditModal({
  open,
  onOpenChange,
  task,
  onSave
}: TaskSaveEditModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo' as Task['status'],
    priority: task?.priority || 'medium' as Task['priority'],
    projectId: task?.projectId || '',
    assignedToId: task?.assignedToId || '',
    dueDate: task?.dueDate || '',
    createdBy: task?.createdBy || user?.name || '',
  });

  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [teamMembers, setTeamMembers] = useState<{id: string, name: string}[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingProjects(true);
      fetch('/api/projects', { credentials: 'include', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data?.data)) {
            setProjects(data.data.map((p: any) => ({ id: String(p.id), name: p.title })));
          } else {
            setProjects([]);
          }
        })
        .catch(() => setProjects([]))
        .finally(() => setLoadingProjects(false));

      setLoadingUsers(true);
      fetch('/api/users', { credentials: 'include', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data?.data)) {
            setTeamMembers(data.data.map((u: any) => ({ id: String(u.id), name: u.name || u.email })));
          } else {
            setTeamMembers([]);
          }
        })
        .catch(() => setTeamMembers([]))
        .finally(() => setLoadingUsers(false));
    }
  }, [open]);

  const handleChange = (field: keyof typeof formData) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (projectId: string) => {
    setFormData(prev => ({ ...prev, projectId }));
  };

  const handleAssigneeChange = (memberId: string) => {
    setFormData(prev => ({ ...prev, assignedToId: memberId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: 'Erreur', description: 'Le titre de la tâche est requis', variant: 'destructive' });
      return;
    }
    if (!formData.projectId) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un projet', variant: 'destructive' });
      return;
    }
    if (!formData.assignedToId) {
      toast({ title: 'Erreur', description: 'Veuillez assigner la tâche à quelqu\'un', variant: 'destructive' });
      return;
    }
    if (!formData.dueDate) {
      toast({ title: 'Erreur', description: 'La date d\'échéance est requise', variant: 'destructive' });
      return;
    }
    const payload: any = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      project_id: formData.projectId,
      assigned_to: formData.assignedToId,
      due_date: formData.dueDate,
      created_by: formData.createdBy
    };
    if (isEditing && task?.id) {
      payload.id = task.id;
    }
    onSave(payload);
    onOpenChange(false);
    toast({
      title: isEditing ? 'Tâche modifiée' : 'Tâche créée',
      description: `La tâche "${formData.title}" a été ${isEditing ? 'modifiée' : 'créée'} avec succès`
    });
    if (!isEditing) {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        projectId: '',
        assignedToId: '',
        dueDate: '',
        createdBy: user?.name || '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de la tâche ci-dessous'
              : 'Remplissez les informations pour créer une nouvelle tâche'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la tâche *</Label>
              <Input
                id="title"
                placeholder="Titre de la tâche"
                value={formData.title}
                onChange={(e) => handleChange('title')(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez la tâche en détail..."
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description')(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Projet *</Label>
              <Select value={formData.projectId} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un projet..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingProjects ? (
                    <SelectItem value="" disabled>Chargement...</SelectItem>
                  ) : projects.length === 0 ? (
                    <SelectItem value="" disabled>Aucun projet</SelectItem>
                  ) : (
                    projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assignée à *</Label>
              <Select value={formData.assignedToId} onValueChange={handleAssigneeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Assigner à..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingUsers ? (
                    <SelectItem value="" disabled>Chargement...</SelectItem>
                  ) : teamMembers.length === 0 ? (
                    <SelectItem value="" disabled>Aucun utilisateur</SelectItem>
                  ) : (
                    teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={handleChange('status')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le statut..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="review">En révision</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={formData.priority} onValueChange={handleChange('priority')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la priorité..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Modifier' : 'Créer la tâche'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
