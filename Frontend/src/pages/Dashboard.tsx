import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  FolderKanban, 
  TrendingUp,
  Plus,
  CheckCircle,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import dashboardHero from '@/assets/dashboard-hero.jpg';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

interface RecentProject {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'on-hold';
  owner: string;
  progress: number;
  dueDate: string;
}

const statsCards: StatCard[] = [
  {
    title: 'Projets totaux',
    value: '24',
    change: '+12%',
    changeType: 'positive',
    icon: FolderKanban,
  },
  {
    title: 'Utilisateurs actifs',
    value: '156',
    change: '+5%',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Taux d\'achèvement',
    value: '87%',
    change: '+3%',
    changeType: 'positive',
    icon: TrendingUp,
  },
  {
    title: 'Projets ce mois',
    value: '8',
    change: '-2%',
    changeType: 'negative',
    icon: BarChart3,
  },
];

const recentProjects: RecentProject[] = [
  {
    id: '1',
    name: 'Refonte du site web',
    status: 'active',
    owner: 'Marie Dubois',
    progress: 75,
    dueDate: '2024-10-15',
  },
  {
    id: '2',
    name: 'Application mobile',
    status: 'on-hold',
    owner: 'Jean Martin',
    progress: 45,
    dueDate: '2024-11-20',
  },
  {
    id: '3',
    name: 'Migration base de données',
    status: 'completed',
    owner: 'Sophie Leroy',
    progress: 100,
    dueDate: '2024-09-30',
  },
  {
    id: '4',
    name: 'Système de notifications',
    status: 'active',
    owner: 'Pierre Durand',
    progress: 30,
    dueDate: '2024-12-01',
  },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Actif</Badge>;
      case 'completed':
        return <Badge className="bg-info text-info-foreground">Terminé</Badge>;
      case 'on-hold':
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-hero p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {user?.name} 👋
          </h1>
          <p className="text-white/80 mb-6 max-w-2xl">
            Bienvenue sur votre tableau de bord SecureBoard. Gérez vos projets, suivez les performances de votre équipe et pilotez vos activités en temps réel.
          </p>
          <div className="flex gap-3">
          <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau projet
          </Button>
          <Button 
            variant="ghost" 
            className="text-white border-white/20 hover:bg-white/10"
            onClick={() => navigate('/tasks')}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Voir toutes les tâches
          </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <img 
            src={dashboardHero} 
            alt="Dashboard" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <p className={`text-xs ${getChangeColor(stat.changeType)}`}>
                {stat.change} par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-card-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Projets récents</CardTitle>
                <CardDescription>
                  Vos projets les plus récemment modifiés
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium text-accent-foreground">{project.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{project.owner}</span>
                      <span>•</span>
                      <span>Échéance: {new Date(project.dueDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(project.status)}
                      <span className="text-xs text-muted-foreground">
                        {project.progress}% complété
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières actions sur vos projets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Projet "Refonte du site web" mis à jour</p>
                  <p className="text-xs text-muted-foreground">Par Marie Dubois • Il y a 2h</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-info rounded-full mt-2 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nouveau membre ajouté à l'équipe</p>
                  <p className="text-xs text-muted-foreground">Pierre Durand rejoint le projet • Il y a 4h</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Échéance approchante</p>
                  <p className="text-xs text-muted-foreground">Application mobile dans 3 jours • Il y a 6h</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Migration terminée avec succès</p>
                  <p className="text-xs text-muted-foreground">Sophie Leroy • Hier</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};