import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-secondary px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8 space-y-6">
          {/* Large 404 */}
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <div className="w-16 h-1 bg-gradient-primary mx-auto rounded-full"></div>
          </div>
          
          {/* Error illustration */}
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-muted-foreground" />
          </div>
          
          {/* Error message */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Page introuvable</h2>
            <p className="text-muted-foreground">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            </p>
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
          <div className="text-xs text-muted-foreground pt-4 border-t border-border">
            Besoin d'aide ? Contactez notre{' '}
            <a href="#" className="text-primary hover:text-primary-hover underline">
              support technique
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};