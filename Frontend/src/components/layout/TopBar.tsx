import React from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export const TopBar: React.FC = () => {
  const { user } = useAuth();
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      case 'manager':
        return 'bg-warning text-warning-foreground';
      case 'user':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent" />
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              className="pl-9 bg-background border-input"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </span>
          </Button>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground">{user.name}</p>
                  <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};