import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir votre adresse email',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
      toast({
        title: 'Email envoyé',
        description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer l\'email. Vérifiez votre adresse.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-secondary px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Email envoyé</CardTitle>
              <CardDescription>
                Nous avons envoyé un lien de réinitialisation à votre adresse email
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-success-light border border-success/20 rounded-lg">
              <p className="text-sm text-success">
                Un email contenant les instructions de réinitialisation a été envoyé à <strong>{email}</strong>
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas reçu l'email ? Vérifiez vos spams ou essayez à nouveau.
              </p>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Renvoyer l'email
                </Button>
                
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-secondary px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
            <CardDescription>
              Saisissez votre email pour recevoir un lien de réinitialisation
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Envoi en cours...
                </div>
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </Button>
          </form>
          
          <div className="mt-6">
            <Link to="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};