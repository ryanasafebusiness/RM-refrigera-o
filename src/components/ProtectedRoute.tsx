import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authAPI } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Verificar token chamando a API
        const { user } = await authAPI.me();
        
        if (user) {
          setIsAuthenticated(true);
          // Por enquanto, não há verificação de admin
          // Pode ser implementado depois se necessário
          setIsAdmin(false);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Verificar autenticação periodicamente (a cada 5 minutos)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [requireAdmin]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    toast.error("Acesso negado. Permissões de administrador necessárias.");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
