import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ClipboardList, LogOut, Wrench, Clock, CheckCircle, XCircle, Loader2, Users, FileText, TrendingUp } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/ThemeToggle";
import MobileNavigation from "@/components/MobileNavigation";

interface ServiceOrder {
  id: string;
  os_number: number;
  status: string;
  start_datetime: string;
  client_name: string;
  location: string;
  problem_description: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("service_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendente":
        return "bg-warning text-warning-foreground";
      case "Em Andamento":
        return "bg-primary text-primary-foreground";
      case "Concluída":
        return "bg-success text-success-foreground";
      case "Cancelada":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Calcular estatísticas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pendente").length,
    inProgress: orders.filter(o => o.status === "Em Andamento").length,
    completed: orders.filter(o => o.status === "Concluída").length,
    cancelled: orders.filter(o => o.status === "Cancelada").length,
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
              <img src="/logo-cyan.svg" alt="RM Refrigeração" className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold truncate">RM Refrigeração</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Sistema de Ordens de Serviço</p>
            </div>
          </div>
                 <div className="flex items-center gap-2">
                   <Button variant="outline" size="sm" onClick={() => navigate("/clients")} className="hidden md:flex">
                     <Users className="w-4 h-4 mr-2" />
                     Clientes
                   </Button>
                   <ThemeToggle />
                   <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:flex">
                     <LogOut className="w-4 h-4 mr-2" />
                     Sair
                   </Button>
                 </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardDescription className="text-xs">Total</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-[10px] md:text-xs text-muted-foreground">Ordens de Serviço</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardDescription className="text-xs">Pendentes</CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-warning">{stats.pending}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center gap-1">
                <Clock className="w-2 h-2 md:w-3 md:h-3 text-muted-foreground" />
                <p className="text-[10px] md:text-xs text-muted-foreground">Aguardando</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardDescription className="text-xs">Em Andamento</CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-primary">{stats.inProgress}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center gap-1">
                <Wrench className="w-2 h-2 md:w-3 md:h-3 text-muted-foreground" />
                <p className="text-[10px] md:text-xs text-muted-foreground">Executando</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardDescription className="text-xs">Concluídas</CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-success">{stats.completed}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-2 h-2 md:w-3 md:h-3 text-muted-foreground" />
                <p className="text-[10px] md:text-xs text-muted-foreground">Finalizadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate("/orders")}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Ordens de Serviço</CardTitle>
                  <CardDescription>Gerenciar OS</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualizar e gerenciar todas as ordens de serviço
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate("/order/new")}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-success" />
                </div>
                <div>
                  <CardTitle>Nova OS</CardTitle>
                  <CardDescription>Criar ordem</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Registrar uma nova ordem de serviço
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate("/clients")}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Clientes</CardTitle>
                  <CardDescription>Cadastro</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gerenciar cadastro de clientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Ordens Recentes
                </CardTitle>
                <Button variant="link" onClick={() => navigate("/orders")}>
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/order/${order.id}/details`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">OS #{order.os_number}</p>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.client_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{order.location}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(order.start_datetime).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <MobileNavigation />
    </div>
  );
};

export default Dashboard;
