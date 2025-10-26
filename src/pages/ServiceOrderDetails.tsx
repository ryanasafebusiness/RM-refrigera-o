import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Edit, Loader2, MapPin, Phone, User, Clock, Wrench, CheckCircle, XCircle, FileText } from "lucide-react";
import ServiceReport from "@/components/ServiceReport";

interface ServiceOrder {
  id: string;
  os_number: number;
  status: string;
  start_datetime: string;
  completion_datetime?: string;
  technician_id: string;
  client_name: string;
  location: string;
  contact_name: string;
  contact_phone: string;
  problem_description: string;
  service_description?: string;
  internal_notes?: string;
}

interface Technician {
  id: string;
  name: string;
}

interface PartItem {
  id: string;
  item_name: string;
  quantity: number;
}

interface ReplacedPart {
  id: string;
  old_part: string;
  new_part: string;
}

const ServiceOrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [partsUsed, setPartsUsed] = useState<PartItem[]>([]);
  const [partsReplaced, setPartsReplaced] = useState<ReplacedPart[]>([]);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("service_orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setOrder(data);
      loadTechnician(data.technician_id);
      loadParts();
    } catch (error: any) {
      toast.error("Erro ao carregar OS");
    } finally {
      setLoading(false);
    }
  };

  const loadTechnician = async (technicianId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("id", technicianId)
        .single();

      if (data) {
        setTechnician({ id: data.id, name: data.name });
      } else {
        // Fallback: try to get from auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === technicianId) {
          setTechnician({ 
            id: user.id, 
            name: user.user_metadata?.name || user.email?.split('@')[0] || "Técnico" 
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar técnico:", error);
      setTechnician({ id: technicianId, name: "Técnico" });
    }
  };

  const loadParts = async () => {
    if (!id) return;
    
    try {
      const { data: used } = await supabase
        .from("order_parts_used")
        .select("*")
        .eq("order_id", id);
      
      const { data: replaced } = await supabase
        .from("order_parts_replaced")
        .select("*")
        .eq("order_id", id);
      
      if (used) setPartsUsed(used);
      if (replaced) setPartsReplaced(replaced);
    } catch (error) {
      console.error("Erro ao carregar peças:", error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p>Carregando OS...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">OS não encontrada</p>
          <Button onClick={() => navigate("/dashboard")}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">OS #{order.os_number}</h1>
              <Badge className={getStatusColor(order.status)}>
                <span className="mr-1">{getStatusIcon(order.status)}</span>
                {order.status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowReport(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Relatório
            </Button>
            <Button onClick={() => navigate(`/order/${id}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{order.client_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Local
              </p>
              <p className="font-medium">{order.location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="w-4 h-4" />
                Contato
              </p>
              <p className="font-medium">{order.contact_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Telefone
              </p>
              <p className="font-medium">{order.contact_phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Informações da OS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Informações da OS
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Data de Início</p>
              <p className="font-medium">
                {new Date(order.start_datetime).toLocaleString("pt-BR")}
              </p>
            </div>
            {order.completion_datetime && (
              <div>
                <p className="text-sm text-muted-foreground">Data de Conclusão</p>
                <p className="font-medium">
                  {new Date(order.completion_datetime).toLocaleString("pt-BR")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Técnico Responsável */}
        {technician && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Técnico Responsável
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-lg">{technician.name}</p>
                  <p className="text-sm text-muted-foreground">Técnico Responsável</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Descrição do Problema */}
        <Card>
          <CardHeader>
            <CardTitle>Descrição do Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{order.problem_description}</p>
          </CardContent>
        </Card>

        {/* Descrição do Serviço */}
        {order.service_description && (
          <Card>
            <CardHeader>
              <CardTitle>Descrição do Serviço Realizado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{order.service_description}</p>
            </CardContent>
          </Card>
        )}

        {/* Peças Utilizadas */}
        {partsUsed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Peças Utilizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {partsUsed.map((part) => (
                  <div key={part.id} className="flex justify-between items-center p-3 bg-muted rounded">
                    <span>{part.item_name}</span>
                    <Badge variant="secondary">Quantidade: {part.quantity}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Peças Substituídas */}
        {partsReplaced.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Peças Substituídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {partsReplaced.map((part) => (
                  <div key={part.id} className="p-3 bg-muted rounded">
                    <p className="font-medium">De: {part.old_part}</p>
                    <p className="text-sm text-muted-foreground">Para: {part.new_part}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações Internas */}
        {order.internal_notes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações Internas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{order.internal_notes}</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Service Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <ServiceReport 
              orderId={id!} 
              onClose={() => setShowReport(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOrderDetails;
