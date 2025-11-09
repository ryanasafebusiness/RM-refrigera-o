import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serviceOrdersAPI, orderPhotosAPI, orderPartsAPI, authAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Edit, Loader2, MapPin, Phone, User, Clock, Wrench, CheckCircle, XCircle, FileText, Camera } from "lucide-react";
import ServiceReport from "@/components/ServiceReport";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MobileNavigation from "@/components/MobileNavigation";
import { ThemeToggle } from "@/components/ThemeToggle";

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

interface ReplacedPart {
  id: string;
  old_part: string;
  new_part: string;
  part_value?: number;
}

interface OrderPhoto {
  id: string;
  photo_url: string;
  photo_type: string;
  media_type: string;
  duration_seconds?: number;
}

const ServiceOrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [partsReplaced, setPartsReplaced] = useState<ReplacedPart[]>([]);
  const [photos, setPhotos] = useState<OrderPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<OrderPhoto | null>(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { order } = await serviceOrdersAPI.getById(id);
      setOrder(order);
      
      if (order.technician_id) {
        loadTechnician(order.technician_id);
      }
      loadParts();
      loadPhotos();
    } catch (error: any) {
      console.error("Erro ao carregar OS:", error);
      toast.error(error.message || "Erro ao carregar OS");
    } finally {
      setLoading(false);
    }
  };

  const loadTechnician = async (technicianId: string) => {
    try {
      // Try to get user info from current auth
      const { user } = await authAPI.me();
      if (user && user.id === technicianId) {
        setTechnician({ 
          id: user.id, 
          name: user.name || user.email?.split('@')[0] || "Técnico" 
        });
      } else {
        // Fallback: use technician ID as name
        setTechnician({ id: technicianId, name: "Técnico" });
      }
    } catch (error) {
      console.error("Erro ao carregar técnico:", error);
      setTechnician({ id: technicianId, name: "Técnico" });
    }
  };

  const loadParts = async () => {
    if (!id) return;
    
    try {
      const { parts } = await orderPartsAPI.getByOrderId(id);
      setPartsReplaced(parts || []);
    } catch (error) {
      console.error("Erro ao carregar peças:", error);
    }
  };

  const loadPhotos = async () => {
    if (!id) return;
    
    try {
      const { photos } = await orderPhotosAPI.getByOrderId(id);
      setPhotos(photos || []);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
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
    <div className="min-h-screen bg-background pb-24">
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
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowReport(true)}
              className="hidden md:flex"
            >
              <FileText className="w-4 h-4 mr-2" />
              Relatório
            </Button>
            <Button 
              onClick={() => navigate(`/order/${id}`)}
              className="hidden md:flex"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <ThemeToggle />
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
                    {part.part_value && (
                      <p className="text-sm font-semibold text-primary mt-1">
                        Valor: R$ {part.part_value.toFixed(2)}
                      </p>
                    )}
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

        {/* Fotos e Vídeos */}
        {photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Fotos e Vídeos da OS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    {photo.media_type === "video" ? (
                      <div className="relative">
                        <video
                          src={photo.photo_url}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {photo.duration_seconds}s
                        </div>
                      </div>
                    ) : (
                      <img
                        src={photo.photo_url}
                        alt={photo.photo_type === "problem" ? "Problema" : "Solução"}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {photo.photo_type === "problem" ? "Problema" : "Solução"}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors" />
                  </div>
                ))}
              </div>
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

      {/* Photo Viewer Modal */}
      <Dialog open={selectedPhoto !== null} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          {selectedPhoto && (
            <div className="relative">
              {selectedPhoto.media_type === "video" ? (
                <video
                  src={selectedPhoto.photo_url}
                  controls
                  className="w-full h-auto rounded-lg"
                  autoPlay
                >
                  Seu navegador não suporta vídeos.
                </video>
              ) : (
                <img
                  src={selectedPhoto.photo_url}
                  alt={selectedPhoto.photo_type === "problem" ? "Foto do Problema" : "Foto da Solução"}
                  className="w-full h-auto rounded-lg"
                />
              )}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded">
                <p className="font-medium">
                  {selectedPhoto.photo_type === "problem" ? "📷 Foto do Problema" : "✅ Foto da Solução"}
                </p>
                {selectedPhoto.duration_seconds && (
                  <p className="text-xs text-gray-300">Duração: {selectedPhoto.duration_seconds}s</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MobileNavigation />
    </div>
  );
};

export default ServiceOrderDetails;
