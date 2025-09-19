import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  Shield,
  LogOut,
  CheckCircle
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projets',
    url: '/projects',
    icon: FolderKanban,
  },
  {
    title: 'Tâches',
    url: '/tasks',
    icon: CheckCircle,
  },
  {
    title: 'Utilisateurs',
    url: '/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Paramètres',
    url: '/settings',
    icon: Settings,
  },
];

export const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, logout } = useAuth();
  const location = useLocation();

  const canAccessRoute = (item: NavigationItem): boolean => {
    if (!item.roles || !user) return true;
    return item.roles.includes(user.role);
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-sidebar-foreground">SecureBoard</h1>
              <p className="text-xs text-sidebar-foreground/60">Project Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems
                .filter(canAccessRoute)
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive: navIsActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-smooth font-medium ${
                          navIsActive || isActive(item.url)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with user info */}
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sidebar-foreground truncate text-sm">
                    {user.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize">
                    {user.role}
                  </p>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className={`w-full ${collapsed ? 'px-2' : 'justify-start'} text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Déconnexion</span>}
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};