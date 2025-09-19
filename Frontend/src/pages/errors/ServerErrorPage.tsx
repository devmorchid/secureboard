import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const ServerErrorPage: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-secondary px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8 space-y-6">
          {/* Error code */}
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-warning">500</h1>
            <div className="w-16 h-1 bg-warning mx-auto rounded-full"></div>
          </div>
          
          {/* Error illustration */}
          <div className="mx-auto w-24 h-24 bg-warning-light rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-warning" />
          </div>
          
          {/* Error message */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Erreur serveur</h2>
            <p className="text-muted-foreground">
              Une erreur interne du serveur s'est produite. Nos équipes ont été notifiées.
            </p>
          </div>
          
          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser la page
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </div>
          </div>
          
          {/* Status info */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Si le problème persiste, vérifiez notre{' '}
                <a href="#" className="text-primary hover:text-primary-hover underline">
                  page de statut
                </a>
                {' '}ou contactez le{' '}
                <a href="#" className="text-primary hover:text-primary-hover underline">
                  support technique
                </a>
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Code d'erreur: SB-500-{Date.now().toString().slice(-6)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};