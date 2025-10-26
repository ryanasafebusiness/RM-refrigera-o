import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  const [partsUsed, setPartsUsed] = useState<PartItem[]>([]);
  const [partsReplaced, setPartsReplaced] = useState<ReplacedPart[]>([]);
  const [signature, setSignature] = useState<string>("");
  const [showReport, setShowReport] = useState(false);
  const [technician, setTechnician] = useState<{ id: string; name: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Parts management states
  const [newPartName, setNewPartName] = useState("");
  const [newPartQuantity, setNewPartQuantity] = useState(1);
  const [newOldPart, setNewOldPart] = useState("");
  const [newNewPart, setNewNewPart] = useState("");

  useEffect(() => {
    if (!isNewOrder) {
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

      setStatus(data.status);
      setClientName(data.client_name);
      setLocation(data.location);
      setContactName(data.contact_name);
      setContactPhone(data.contact_phone);
      setProblemDescription(data.problem_description);
      setServiceDescription(data.service_description || "");
      setInternalNotes(data.internal_notes || "");

      loadPhotos();
      loadParts();
      loadSignature();
      loadTechnician(data.technician_id);
    } catch (error: any) {
      toast.error("Erro ao carregar OS");
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    const { data } = await supabase.from("order_photos").select("*").eq("order_id", id);
    if (data) setPhotos(data);
  };

  const loadParts = async () => {
    const { data: used } = await supabase.from("order_parts_used").select("*").eq("order_id", id);
    const { data: replaced } = await supabase.from("order_parts_replaced").select("*").eq("order_id", id);
    if (used) setPartsUsed(used);
    if (replaced) setPartsReplaced(replaced);
  };

  const loadSignature = async () => {
    try {
      const { data, error } = await supabase.from("order_signatures").select("*").eq("order_id", id).single();
      if (data && !error) {
        setSignature(data.signature_data);
      } else if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - this is expected if no signature exists
        console.warn('Erro ao carregar assinatura:', error.message);
      }
    } catch (error) {
      console.warn('Erro ao carregar assinatura:', error);
    }
  };

  const loadTechnician = async (technicianId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name")
        .eq("user_id", technicianId)
        .single();

      if (error) throw error;
      setTechnician({ id: data.user_id, name: data.name });
    } catch (error) {
      console.error("Erro ao carregar técnico:", error);
      // Se não encontrar no profiles, tenta buscar o usuário diretamente
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user && userData.user.id === technicianId) {
        setTechnician({ 
          id: userData.user.id, 
          name: userData.user.user_metadata?.name || "Técnico" 
        });
      }
    }
  };

  const addPartUsed = async () => {
    if (!newPartName.trim() || !id) return;

    try {
      const { data, error } = await supabase
        .from("order_parts_used")
        .insert({
          order_id: id,
          item_name: newPartName.trim(),
          quantity: newPartQuantity
        })
        .select()
        .single();

      if (error) throw error;
      
      setPartsUsed([...partsUsed, data]);
      setNewPartName("");
      setNewPartQuantity(1);
      toast.success("Peça adicionada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao adicionar peça: " + error.message);
    }
  };

  const addPartReplaced = async () => {
    if (!newOldPart.trim() || !newNewPart.trim() || !id) return;

    try {
      const { data, error } = await supabase
        .from("order_parts_replaced")
        .insert({
          order_id: id,
          old_part: newOldPart.trim(),
          new_part: newNewPart.trim()
        })
        .select()
        .single();

      if (error) throw error;
      
      setPartsReplaced([...partsReplaced, data]);
      setNewOldPart("");
      setNewNewPart("");
      toast.success("Substituição adicionada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao adicionar substituição: " + error.message);
    }
  };

  const removePartUsed = async (partId: string) => {
    try {
      const { error } = await supabase
        .from("order_parts_used")
        .delete()
        .eq("id", partId);

      if (error) throw error;
      
      setPartsUsed(partsUsed.filter(p => p.id !== partId));
      toast.success("Peça removida com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao remover peça: " + error.message);
    }
  };

  const removePartReplaced = async (partId: string) => {
    try {
      const { error } = await supabase
        .from("order_parts_replaced")
        .delete()
        .eq("id", partId);

      if (error) throw error;
      
      setPartsReplaced(partsReplaced.filter(p => p.id !== partId));
      toast.success("Substituição removida com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao remover substituição: " + error.message);
    }
  };

  const handleDeleteOrder = async () => {
    if (!id) {
      console.error("No ID provided for deletion");
      return;
    }

    try {
      console.log("Starting deletion process for order:", id);
      setLoading(true);
      
      // Verify user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Authentication error:", authError);
        toast.error("Erro de autenticação");
        return;
      }
      
      console.log("User authenticated:", user.id);
      
      // With ON DELETE CASCADE, we only need to delete the main order
      // All related data will be automatically deleted
      console.log("Attempting to delete order from database...");
      const { data, error: orderError } = await supabase
        .from("service_orders")
        .delete()
        .eq("id", id)
        .select();

      console.log("Delete result:", { data, error: orderError });

      if (orderError) {
        console.error("Error deleting order:", orderError);
        
        // Check if it's an RLS policy error
        if (orderError.message?.includes("row-level security") || orderError.code === 'PGRST301') {
          toast.error("Você não tem permissão para excluir esta OS");
        } else {
          throw orderError;
        }
        return;
      }

      console.log("Order deleted successfully");
      toast.success("OS excluída com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Complete delete error:", error);
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Erro de autenticação: " + authError.message);
      }
      
      if (!user) {
        console.error("No user found");
        throw new Error("Usuário não autenticado");
      }

      console.log("User ID:", user.id);
      console.log("Creating order with technician_id:", user.id);

      if (isNewOrder) {
        const orderData = {
          status,
          technician_id: user.id,
          client_name: clientName,
          location,
          contact_name: contactName,
          contact_phone: contactPhone,
          problem_description: problemDescription,
          service_description: serviceDescription,
          internal_notes: internalNotes,
        };

        console.log("Order data:", orderData);

        const { data, error } = await supabase
          .from("service_orders")
          .insert(orderData)
          .select()
          .single();

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        
        // Save signature if exists
        if (signature) {
          console.log("Saving signature for new order:", data.id);
          const { data: sigData, error: sigError } = await supabase
            .from("order_signatures")
            .insert({
              order_id: data.id,
              signature_data: signature,
            })
            .select();
          
          if (sigError) {
            console.error("Error saving signature:", sigError);
            toast.error("Assinatura não foi salva: " + sigError.message);
          } else {
            console.log("Signature saved successfully:", sigData);
          }
        } else {
          console.log("No signature to save");
        }
        
        toast.success("OS criada com sucesso!");
        navigate(`/order/${data.id}`);
      } else {
        const { error } = await supabase
          .from("service_orders")
          .update({
            status,
            client_name: clientName,
            location,
            contact_name: contactName,
            contact_phone: contactPhone,
            problem_description: problemDescription,
            service_description: serviceDescription,
            internal_notes: internalNotes,
            completion_datetime: status === "Concluída" ? new Date().toISOString() : null,
          })
          .eq("id", id);

        if (error) throw error;
        
        // Save or update signature
        if (signature && id) {
          console.log("Saving/updating signature for order:", id);
          const { data: sigData, error: sigError } = await supabase
            .from("order_signatures")
            .upsert({
              order_id: id,
              signature_data: signature,
            })
            .select();
          
          if (sigError) {
            console.error("Error saving signature:", sigError);
            toast.error("Assinatura não foi salva: " + sigError.message);
          } else {
            console.log("Signature saved successfully:", sigData);
          }
        } else {
          console.log("No signature to save");
        }
        
        toast.success("OS atualizada com sucesso!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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

              {/* Parts Used */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Peças Utilizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {partsUsed.map((part) => (
                      <div key={part.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{part.item_name}</p>
                          <p className="text-sm text-muted-foreground">Quantidade: {part.quantity}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePartUsed(part.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nome da peça"
                        value={newPartName}
                        onChange={(e) => setNewPartName(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Qtd"
                        value={newPartQuantity}
                        onChange={(e) => setNewPartQuantity(parseInt(e.target.value) || 1)}
                        className="w-20"
                        min="1"
                      />
                      <Button
                        onClick={addPartUsed}
                        disabled={!newPartName.trim()}
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
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
    </div>
  );
};

export default ServiceOrder;
