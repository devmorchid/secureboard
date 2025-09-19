import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Flag
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
import { TaskSaveEditModal } from '@/components/tasks/TaskSaveEditModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;
  projectName: string;
  assignedTo: string;
  assignedToId: string;
  createdBy: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
}

// Données de démonstration
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Conception de la maquette homepage',
    description: 'Créer les wireframes et maquettes haute fidélité pour la page d\'accueil',
    status: 'in-progress',
    priority: 'high',
    projectId: '1',
    projectName: 'Refonte du site web',
    assignedTo: 'Marie Dubois',
    assignedToId: '1',
    createdBy: 'Jean Martin',
    dueDate: '2024-10-20',
    createdAt: '2024-09-15T09:00:00Z',
    estimatedHours: 16,
    actualHours: 8,
  },
  {
    id: '2', 
    title: 'Développement API authentification',
    description: 'Implémenter les endpoints d\'authentification JWT avec validation',
    status: 'todo',
    priority: 'urgent',
    projectId: '2',
    projectName: 'Application mobile',
    assignedTo: 'Pierre Durand',
    assignedToId: '4',
    createdBy: 'Sophie Leroy',
    dueDate: '2024-10-25',
    createdAt: '2024-09-16T14:30:00Z',
    estimatedHours: 20,
  },
  {
    id: '3',
    title: 'Tests unitaires migration',
    description: 'Écrire les tests pour valider la migration des données',
    status: 'completed',
    priority: 'medium',
    projectId: '3',
    projectName: 'Migration base de données',
    assignedTo: 'Sophie Leroy',
    assignedToId: '3',
    createdBy: 'Sophie Leroy',
    dueDate: '2024-09-28',
    createdAt: '2024-09-10T11:15:00Z',
    completedAt: '2024-09-25T16:45:00Z',
    estimatedHours: 12,
    actualHours: 14,
  },
  {
    id: '4',
    title: 'Configuration serveur notifications',
    description: 'Configurer le serveur WebSocket pour les notifications temps réel',
    status: 'review',
    priority: 'medium',
    projectId: '4',
    projectName: 'Système de notifications',
    assignedTo: 'Anna Moreau',
    assignedToId: '5',
    createdBy: 'Pierre Durand',
    dueDate: '2024-11-15',
    createdAt: '2024-09-18T13:20:00Z',
    estimatedHours: 8,
    actualHours: 6,
  },
];

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const canManageTask = (task: Task): boolean => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'manager' || task.assignedToId === user.id || task.createdBy === user.name;
  };

  const canViewAllTasks = (): boolean => {
    return user?.role === 'admin' || user?.role === 'manager';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return <Badge variant="secondary">À faire</Badge>;
      case 'in-progress':
        return <Badge className="bg-info text-info-foreground">En cours</Badge>;
      case 'review':
        return <Badge className="bg-warning text-warning-foreground">En révision</Badge>;
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Terminée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-destructive text-destructive-foreground">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-warning text-warning-foreground">Haute</Badge>;
      case 'medium':
        return <Badge variant="secondary">Moyenne</Badge>;
      case 'low':
        return <Badge className="bg-muted text-muted-foreground">Basse</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-info" />;
      case 'review':
        return <Flag className="w-4 h-4 text-warning" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const projects = Array.from(new Set(tasks.map(t => t.projectName)));

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || task.projectName === projectFilter;
    const hasAccess = canViewAllTasks() || task.assignedToId === user?.id;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject && hasAccess;
  });

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      // Modifier une tâche existante
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...taskData }
          : task
      ));
    } else {
      // Créer une nouvelle tâche
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: 'Tâche supprimée',
      description: 'La tâche a été supprimée avec succès',
      variant: 'destructive',
    });
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
          }
        : task
    ));
    toast({
      title: 'Statut mis à jour',
      description: `La tâche est maintenant "${getStatusLabel(newStatus)}"`,
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'À faire';
      case 'in-progress': return 'En cours';
      case 'review': return 'En révision';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tâches</h1>
          <p className="text-muted-foreground mt-2">
            Gérez et suivez toutes vos tâches par projet
          </p>
        </div>
        <Button onClick={handleCreateTask} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-1 gap-4 max-w-2xl flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="todo">À faire</SelectItem>
              <SelectItem value="in-progress">En cours</SelectItem>
              <SelectItem value="review">En révision</SelectItem>
              <SelectItem value="completed">Terminée</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="low">Basse</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Projet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les projets</SelectItem>
              {projects.map(project => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="border border-card-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Tâche</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Assignée à</TableHead>
              <TableHead>Projet</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Temps</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <div className="font-medium text-foreground">{task.title}</div>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2 max-w-96">
                      {task.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])}
                    disabled={!canManageTask(task)}
                  >
                    <SelectTrigger className="w-32 border-none p-0 h-auto">
                      {getStatusBadge(task.status)}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">À faire</SelectItem>
                      <SelectItem value="in-progress">En cours</SelectItem>
                      <SelectItem value="review">En révision</SelectItem>
                      <SelectItem value="completed">Terminée</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {getPriorityBadge(task.priority)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignedTo}`} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {task.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{task.assignedTo}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{task.projectName}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className={`${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    {task.estimatedHours && (
                      <div className="text-muted-foreground">
                        Est: {task.estimatedHours}h
                      </div>
                    )}
                    {task.actualHours && (
                      <div className="text-foreground">
                        Réel: {task.actualHours}h
                      </div>
                    )}
                  </div>
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
                      {canManageTask(task) && (
                        <>
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty state */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Aucune tâche trouvée</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre première tâche'
            }
          </p>
          <Button onClick={handleCreateTask}>
            <Plus className="w-4 h-4 mr-2" />
            Créer une tâche
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-foreground">{tasks.length}</div>
          <div className="text-sm text-muted-foreground">Total tâches</div>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-info">{tasks.filter(t => t.status === 'in-progress').length}</div>
          <div className="text-sm text-muted-foreground">En cours</div>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-warning">{tasks.filter(t => t.status === 'review').length}</div>
          <div className="text-sm text-muted-foreground">En révision</div>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-success">{tasks.filter(t => t.status === 'completed').length}</div>
          <div className="text-sm text-muted-foreground">Terminées</div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskSaveEditModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
};