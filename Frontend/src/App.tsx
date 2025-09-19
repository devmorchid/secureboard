import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Auth pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";

// Main pages
import { Dashboard } from "@/pages/Dashboard";
import { Projects } from "@/pages/Projects";
import { Users } from "@/pages/Users";
import { Tasks } from "@/pages/Tasks";

// Error pages
import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { ForbiddenPage } from "@/pages/errors/ForbiddenPage";
import { ServerErrorPage } from "@/pages/errors/ServerErrorPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Error pages */}
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/500" element={<ServerErrorPage />} />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected routes with layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/projects" element={
              <ProtectedRoute>
                <AppLayout>
                  <Projects />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/tasks" element={
              <ProtectedRoute>
                <AppLayout>
                  <Tasks />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/users" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AppLayout>
                  <Users />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Paramètres</h1>
                    <p className="text-muted-foreground mt-2">Configuration de votre compte et préférences</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* 404 catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
