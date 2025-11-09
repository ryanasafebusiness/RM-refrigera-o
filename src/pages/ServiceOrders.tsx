import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, serviceOrdersAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, ArrowLeft, Wrench, Clock, CheckCircle, XCircle, Loader2, Users, ClipboardList } from "lucide-react";
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

const ServiceOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { orders } = await serviceOrdersAPI.getAll();
      setOrders(orders || []);
    } catch (error: any) {
      console.error("Erro ao carregar ordens de serviço:", error);
      toast.error(error.message || "Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate("/auth");
          return;
        }
        const { user } = await authAPI.me();
        if (user) {
          setUser(user);
          fetchOrders();
        } else {
          navigate("/auth");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pendente":
        return <Clock className="w-4 h-4" />;
      case "Em Andamento":
        return <Wrench className="w-4 h-4" />;
      case "Concluída":
        return <CheckCircle className="w-4 h-4" />;
      case "Cancelada":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.os_number.toString().includes(searchTerm) ||
      order.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <img src="/logo-cyan.svg" alt="RM Refrigeração" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Ordens de Serviço</h1>
              <p className="text-sm text-muted-foreground">Gestão de OS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, OS ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* New Order Button */}
        <Button
          onClick={() => navigate("/order/new")}
          className="w-full h-14 text-lg shadow-lg"
          size="lg"
        >
          <Plus className="w-6 h-6 mr-2" />
          Nova Ordem de Serviço
        </Button>

        {/* Orders List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {filteredOrders.length} {filteredOrders.length === 1 ? "Ordem" : "Ordens"} Encontrada
            {filteredOrders.length !== 1 ? "s" : ""}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Nenhuma ordem encontrada com os filtros aplicados"
                    : "Nenhuma ordem de serviço criada ainda"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/order/${order.id}/details`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">OS #{order.os_number}</CardTitle>
                      <CardDescription>{order.client_name}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      <span className="mr-1">{getStatusIcon(order.status)}</span>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground line-clamp-2">{order.problem_description}</p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Local:</span> {order.location}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Início:</span>{" "}
                      {new Date(order.start_datetime).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
};

export default ServiceOrders;

