import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          navigate("/auth");
          setLoading(false);
          return;
        }

        // Verificar se o token é válido
        const { user } = await authAPI.me();
        
        if (user) {
          navigate("/dashboard");
        } else {
          navigate("/auth");
        }
      } catch (error) {
        // Token inválido ou expirado
        localStorage.removeItem('auth_token');
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return null;
};

export default Index;
