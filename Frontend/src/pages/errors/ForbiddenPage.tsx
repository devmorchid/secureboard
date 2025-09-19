import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-secondary px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8 space-y-6">
          {/* Error code */}
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-destructive">403</h1>
            <div className="w-16 h-1 bg-destructive mx-auto rounded-full"></div>
          </div>
          
          {/* Error illustration */}
          <div className="mx-auto w-24 h-24 bg-destructive-light rounded-full flex items-center justify-center">
            <Lock className="w-12 h-12 text-destructive" />
          </div>
          
          {/* Error message */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Accès interdit</h2>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
            </p>
            {user && (
              <p className="text-sm text-muted-foreground">
                Connecté en tant que <span className="font-medium text-foreground">{user.name}</span> ({user.role})
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Link to="/dashboard">
              <Button className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Retour au tableau de bord
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Page précédente
            </Button>
          </div>
          
          {/* Additional help */}
          <div className="p-4 bg-info-light border border-info/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-info" />
              <span className="text-sm font-medium text-info">Besoin d'accès ?</span>
            </div>
            <p className="text-xs text-info">
              Contactez votre administrateur pour demander les permissions appropriées.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};