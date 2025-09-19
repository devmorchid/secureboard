// ...existing code...
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  FolderKanban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ProjectModal } from '@/components/projects/ProjectModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  owner: string;
  ownerId: string;
  progress: number;
  start_date: string;
  end_date: string;
  team: string[];
  priority: 'low' | 'medium' | 'high';
}

// No more mockProjects; fetch from backend

import React, { useState, useEffect } from 'react';
export const Projects: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Fetch projects from backend on mount
  useEffect(() => {
  fetch('/api/projects', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch(() => setProjects([]));
  }, []);

  const canManageProject = (project: Project): boolean => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'manager' || project.ownerId === user.id;
  };

  const canViewAllProjects = (): boolean => {
    return user?.role === 'admin' || user?.role === 'manager';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Actif</Badge>;
      case 'completed':
        return <Badge className="bg-info text-info-foreground">Terminé</Badge>;
      case 'on-hold':
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive text-destructive-foreground">Annulé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Haute</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Moyenne</Badge>;
      case 'low':
        return <Badge variant="secondary">Basse</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const hasAccess = canViewAllProjects() || project.ownerId === user?.id;
    
    return matchesSearch && matchesStatus && hasAccess;
  });

  const handleEdit = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setEditingProject(project);
      setIsProjectModalOpen(true);
    }
  };

  const handleDelete = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast({
      title: 'Projet supprimé',
      description: `Le projet a été supprimé avec succès`,
      variant: 'destructive',
    });
  };

  const handleView = (projectId: string) => {
    // Navigate to project details or tasks
    navigate(`/tasks?project=${projectId}`);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const fetchProjects = () => {
    fetch('/api/projects', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.data)) {
          setProjects(
            data.data.map((p: any) => ({
              id: String(p.id),
              title: p.title,
              description: p.description,
              status: p.status,
              owner: p.owner?.name || '',
              ownerId: p.owner?.id ? String(p.owner.id) : '',
              progress: 0, // You can update this if your API provides it
              start_date: p.start_date || '',
              end_date: p.end_date || '',
              team: p.team || [], // Update if your API provides team
              priority: p.priority || 'medium', // Update if your API provides priority
            }))
          );
        } else if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
        }
      })
      .catch(() => setProjects([]));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSaveProject = () => {
    // Refetch projects after modal closes
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projets</h1>
          <p className="text-muted-foreground mt-2">
            Gérez et suivez tous vos projets en cours
          </p>
        </div>
        <Button onClick={handleCreateProject} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
              <SelectItem value="on-hold">En attente</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="border-card-border hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(project.status)}
                    {getPriorityBadge(project.priority)}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleView(project.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Voir les détails
                    </DropdownMenuItem>
                    {canManageProject(project) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(project.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(project.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              
              {/* Project info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{project.owner}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Échéance: {
                      project.end_date && !['', null, undefined].includes(project.end_date)
                        ? new Date(project.end_date).toLocaleDateString('fr-FR')
                        : 'Non définie'
                    }
                  </span>
                </div>
              </div>
              
              {/* Team */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Équipe:</span>
                {Array.isArray(project.team) && project.team.length > 0 ? (
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 3).map((member, index) => {
                      let display = '';
                      let title = '';
                      // Type guard for object with name/email
                      const isUserObj = (m: any): m is { name?: string; email?: string } =>
                        m && typeof m === 'object' && !Array.isArray(m) && ('name' in m || 'email' in m);

                      if (isUserObj(member)) {
                        display = member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
                        title = member.name || member.email || '';
                      } else if (typeof member === 'string') {
                        display = member.split(' ').map(n => n[0]).join('').toUpperCase();
                        title = member;
                      } else {
                        display = '';
                        title = '';
                      }
                      return (
                        <div
                          key={index}
                          className="w-6 h-6 bg-primary rounded-full border-2 border-card flex items-center justify-center text-xs text-primary-foreground font-medium"
                          title={title}
                        >
                          {display}
                        </div>
                      );
                    })}
                    {project.team.length > 3 && (
                      <div className="w-6 h-6 bg-muted rounded-full border-2 border-card flex items-center justify-center text-xs text-muted-foreground">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Aucun membre</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Aucun projet trouvé</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre premier projet'
            }
          </p>
          <Button onClick={handleCreateProject}>
            <Plus className="w-4 h-4 mr-2" />
            Créer un projet
          </Button>
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        open={isProjectModalOpen}
        onOpenChange={(open) => {
          setIsProjectModalOpen(open);
          if (!open) fetchProjects();
        }}
        project={editingProject ? {
          id: editingProject.id,
          title: editingProject.title,
          description: editingProject.description,
          status: editingProject.status,
          startDate: editingProject.start_date || '',
          dueDate: editingProject.end_date || '',
          team: Array.isArray(editingProject.team)
            ? editingProject.team.map((m: any) => typeof m === 'object' && m !== null && 'id' in m ? m.id : m)
            : [],
          priority: editingProject.priority || 'medium',
        } : null}
        onSave={handleSaveProject}
      />
    </div>
  );
};