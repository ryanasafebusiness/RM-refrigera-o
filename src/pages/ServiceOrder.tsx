import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serviceOrdersAPI, orderPhotosAPI, orderPartsAPI, orderSignaturesAPI, authAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Plus, X, FileText, Trash2, Wrench, User } from "lucide-react";
import MediaUpload from "@/components/MediaUpload";
import SignatureCanvas from "@/components/SignatureCanvas";
import ServiceReport from "@/components/ServiceReport";
import MobileNavigation from "@/components/MobileNavigation";

interface ReplacedPart {
  id: string;
  old_part: string;
  new_part: string;
  part_value?: number;
}

const ServiceOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNewOrder = !id;

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Pendente");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [photos, setPhotos] = useState<Array<{ id: string; photo_url: string; photo_type: string; media_type: string; duration_seconds?: number }>>([]);
  const [partsReplaced, setPartsReplaced] = useState<ReplacedPart[]>([]);
  const [signature, setSignature] = useState<string>("");
  const [showReport, setShowReport] = useState(false);
  const [technician, setTechnician] = useState<{ id: string; name: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Parts management states
  const [newOldPart, setNewOldPart] = useState("");
  const [newNewPart, setNewNewPart] = useState("");
  const [newPartValue, setNewPartValue] = useState("");
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (!isNewOrder) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { order } = await serviceOrdersAPI.getById(id);

      setStatus(order.status);
      setClientName(order.client_name);
      setLocation(order.location);
      setContactName(order.contact_name);
      setContactPhone(order.contact_phone);
      setProblemDescription(order.problem_description);
      setServiceDescription(order.service_description || "");
      setInternalNotes(order.internal_notes || "");
      setTotalValue(order.total_value || 0);

      loadPhotos();
      loadParts();
      loadSignature();
      if (order.technician_id) {
        loadTechnician(order.technician_id);
      }
    } catch (error: any) {
      console.error("Erro ao carregar OS:", error);
      toast.error(error.message || "Erro ao carregar OS");
    } finally {
      setLoading(false);
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

  const loadParts = async () => {
    if (!id) return;
    try {
      const { parts } = await orderPartsAPI.getByOrderId(id);
      setPartsReplaced(parts || []);
      // Calcular total
      const total = (parts || []).reduce((sum: number, part: any) => sum + (part.part_value || 0), 0);
      setTotalValue(total);
    } catch (error) {
      console.error("Erro ao carregar peças:", error);
    }
  };

  const loadSignature = async () => {
    if (!id) return;
    try {
      const { signature } = await orderSignaturesAPI.getByOrderId(id);
      if (signature) {
        setSignature(signature.signature_data);
      }
    } catch (error) {
      console.warn('Erro ao carregar assinatura:', error);
    }
  };

  const loadTechnician = async (technicianId: string) => {
    try {
      const { user } = await authAPI.me();
      if (user && user.id === technicianId) {
        setTechnician({ 
          id: user.id, 
          name: user.name || user.email?.split('@')[0] || "Técnico" 
        });
      } else {
        setTechnician({ id: technicianId, name: "Técnico" });
      }
    } catch (error) {
      console.error("Erro ao carregar técnico:", error);
      setTechnician({ id: technicianId, name: "Técnico" });
    }
  };

  const addPartReplaced = async () => {
    if (!newOldPart.trim() || !newNewPart.trim() || !id) return;

    try {
      const partValue = parseFloat(newPartValue) || 0;
      
      const { part } = await orderPartsAPI.create(id, {
        old_part: newOldPart.trim(),
        new_part: newNewPart.trim(),
        part_value: partValue
      });
      
      setPartsReplaced([...partsReplaced, part]);
      setNewOldPart("");
      setNewNewPart("");
      setNewPartValue("");
      
      // Atualizar valor total
      const newTotal = totalValue + partValue;
      setTotalValue(newTotal);
      
      toast.success("Substituição adicionada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao adicionar substituição:", error);
      toast.error("Erro ao adicionar substituição: " + (error.message || "Erro desconhecido"));
    }
  };

  const removePartReplaced = async (partId: string) => {
    if (!id) return;
    
    try {
      // Encontrar a peça antes de remover para subtrair do total
      const partToRemove = partsReplaced.find(p => p.id === partId);
      
      await orderPartsAPI.delete(id, partId);
      
      setPartsReplaced(partsReplaced.filter(p => p.id !== partId));
      
      // Atualizar valor total
      if (partToRemove && partToRemove.part_value) {
        const newTotal = totalValue - partToRemove.part_value;
        setTotalValue(Math.max(0, newTotal));
      }
      
      toast.success("Substituição removida com sucesso!");
    } catch (error: any) {
      console.error("Erro ao remover substituição:", error);
      toast.error("Erro ao remover substituição: " + (error.message || "Erro desconhecido"));
    }
  };

  const handleDeleteOrder = async () => {
    if (!id) {
      console.error("No ID provided for deletion");
      return;
    }

    try {
      setLoading(true);
      
      await serviceOrdersAPI.delete(id);
      
      toast.success("OS excluída com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro ao excluir OS:", error);
      toast.error("Erro ao excluir OS: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await authAPI.me();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      if (isNewOrder) {
        const orderData = {
          status,
          client_name: clientName,
          location,
          contact_name: contactName,
          contact_phone: contactPhone,
          problem_description: problemDescription,
          service_description: serviceDescription,
          internal_notes: internalNotes,
        };

        const { order } = await serviceOrdersAPI.create(orderData);
        
        // Save signature if exists
        if (signature && order.id) {
          try {
            await orderSignaturesAPI.create(order.id, signature);
          } catch (sigError: any) {
            console.error("Erro ao salvar assinatura:", sigError);
            toast.error("Assinatura não foi salva: " + (sigError.message || "Erro desconhecido"));
          }
        }
        
        toast.success("OS criada com sucesso!");
        navigate(`/order/${order.id}`);
      } else {
        if (!id) return;
        
        await serviceOrdersAPI.update(id, {
          status,
          client_name: clientName,
          location,
          contact_name: contactName,
          contact_phone: contactPhone,
          problem_description: problemDescription,
          service_description: serviceDescription,
          internal_notes: internalNotes,
          total_value: totalValue,
          completion_datetime: status === "Concluída" ? new Date().toISOString() : null,
        });
        
        // Save or update signature
        if (signature) {
          try {
            // Try to update first, if it fails, create
            try {
              await orderSignaturesAPI.update(id, signature);
            } catch {
              await orderSignaturesAPI.create(id, signature);
            }
          } catch (sigError: any) {
            console.error("Erro ao salvar assinatura:", sigError);
            toast.error("Assinatura não foi salva: " + (sigError.message || "Erro desconhecido"));
          }
        }
        
        toast.success("OS atualizada com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao salvar OS:", error);
      toast.error(error.message || "Erro ao salvar OS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">
            {isNewOrder ? "Nova OS" : `OS #${id}`}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client-name">Nome do Cliente*</Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Local da Manutenção*</Label>
                <Textarea
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-name">Contato no Local*</Label>
                <Input
                  id="contact-name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-phone">Telefone*</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Descrição do Problema*</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={4}
                required
              />
            </CardContent>
          </Card>

          {!isNewOrder && (
            <>
              <MediaUpload
                orderId={id!}
                photoType="problem"
                media={photos.filter((p) => p.photo_type === "problem")}
                onMediaChange={loadPhotos}
                title="Fotos e Vídeos do Problema"
                description="Registre o estado inicial (vídeos até 60s)"
              />

              <Card>
                <CardHeader>
                  <CardTitle>Descrição do Serviço Realizado</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Parts Replaced */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Peças Substituídas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {partsReplaced.map((part) => (
                      <div key={part.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">De: {part.old_part}</p>
                            <p className="text-sm text-muted-foreground">Para: {part.new_part}</p>
                            {part.part_value && (
                              <p className="text-sm font-semibold text-primary mt-1">
                                Valor: R$ {part.part_value.toFixed(2)}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePartReplaced(part.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Input
                        placeholder="Peça antiga (defeituosa)"
                        value={newOldPart}
                        onChange={(e) => setNewOldPart(e.target.value)}
                      />
                      <Input
                        placeholder="Peça nova (substituta)"
                        value={newNewPart}
                        onChange={(e) => setNewNewPart(e.target.value)}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Valor da peça (R$)"
                        value={newPartValue}
                        onChange={(e) => setNewPartValue(e.target.value)}
                      />
                      <Button
                        onClick={addPartReplaced}
                        disabled={!newOldPart.trim() || !newNewPart.trim()}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Substituição
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Valor Total */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💰 Valor Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {totalValue.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    * Valor calculado automaticamente com base nas peças substituídas
                  </p>
                </CardContent>
              </Card>

              <SignatureCanvas onSave={setSignature} existingSignature={signature} />

              {/* Technician Information */}
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
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{technician.name}</p>
                        <p className="text-sm text-muted-foreground">Técnico Responsável</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Status da OS</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluída">Concluída</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </>
          )}

          {!isNewOrder && (
            <div className="flex gap-2 mb-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowReport(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                className="flex-1"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir OS
              </Button>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isNewOrder ? "Criar OS" : "Salvar Alterações"}
              </>
            )}
          </Button>
        </form>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Excluir Ordem de Serviço
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                Tem certeza que deseja excluir esta OS? Esta ação não pode ser desfeita.
                <br />
                <br />
                <strong>Serão excluídos:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Dados da ordem de serviço</li>
                  <li>Fotos e vídeos anexados</li>
                  <li>Peças utilizadas e substituídas</li>
                  <li>Assinatura digital</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir OS
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileNavigation />
    </div>
  );
};

export default ServiceOrder;
