import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, Printer, Calendar, MapPin, Phone, User, Wrench, CheckCircle, XCircle, Clock } from "lucide-react";

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
  total_value?: number;
  created_at: string;
  updated_at: string;
}

interface OrderPhoto {
  id: string;
  photo_url: string;
  photo_type: string;
  media_type: string;
  duration_seconds?: number;
}

interface ReplacedPart {
  id: string;
  old_part: string;
  new_part: string;
  part_value?: number;
}

interface OrderSignature {
  id: string;
  signature_data: string;
  signed_at: string;
}

interface ServiceReportProps {
  orderId: string;
  onClose: () => void;
}

const ServiceReport = ({ orderId, onClose }: ServiceReportProps) => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [photos, setPhotos] = useState<OrderPhoto[]>([]);
  const [partsReplaced, setPartsReplaced] = useState<ReplacedPart[]>([]);
  const [signature, setSignature] = useState<OrderSignature | null>(null);
  const [technician, setTechnician] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadReportData();
  }, [orderId]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Load order data
      const { data: orderData, error: orderError } = await supabase
        .from("service_orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // Load photos
      const { data: photosData } = await supabase
        .from("order_photos")
        .select("*")
        .eq("order_id", orderId);
      setPhotos(photosData || []);

      // Load parts replaced
      const { data: partsReplacedData } = await supabase
        .from("order_parts_replaced")
        .select("*")
        .eq("order_id", orderId);
      setPartsReplaced(partsReplacedData || []);

      // Load signature
      const { data: signatureData, error: signatureError } = await supabase
        .from("order_signatures")
        .select("*")
        .eq("order_id", orderId)
        .single();
      
      if (signatureData && !signatureError) {
        setSignature(signatureData);
      } else if (signatureError && signatureError.code !== 'PGRST116') {
        console.warn('Erro ao carregar assinatura:', signatureError.message);
      }

      // Load technician
      if (orderData.technician_id) {
        loadTechnician(orderData.technician_id);
      }

    } catch (error: any) {
      toast.error("Erro ao carregar dados do relatório");
      console.error(error);
    } finally {
      setLoading(false);
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
      setTechnician({ id: technicianId, name: "Técnico" });
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Serviço - OS #${order?.os_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; color: #2563eb; }
            .report-title { font-size: 18px; margin: 10px 0; }
            .section { margin: 20px 0; }
            .section h3 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
            .info-item { margin: 10px 0; }
            .info-label { font-weight: bold; color: #6b7280; }
            .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
            .status-pendente { background: #fef3c7; color: #92400e; }
            .status-andamento { background: #dbeafe; color: #1e40af; }
            .status-concluida { background: #d1fae5; color: #065f46; }
            .status-cancelada { background: #fee2e2; color: #991b1b; }
            .parts-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .parts-table th, .parts-table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            .parts-table th { background: #f9fafb; font-weight: bold; }
            .signature { margin: 20px 0; }
            .signature img { max-width: 200px; border: 1px solid #d1d5db; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${generateReportHTML()}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateReportHTML = () => {
    if (!order) return "";

    const statusClass = order.status.toLowerCase().replace(/\s+/g, '-');
    
    return `
      <div class="header">
        <div class="company">RM Refrigeração</div>
        <div class="report-title">Relatório de Serviço</div>
        <div>OS #${order.os_number}</div>
      </div>

      <div class="section">
        <h3>Informações do Cliente</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Cliente:</div>
            <div>${order.client_name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status:</div>
            <div><span class="status status-${statusClass}">${order.status}</span></div>
          </div>
          <div class="info-item">
            <div class="info-label">Local:</div>
            <div>${order.location}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Contato:</div>
            <div>${order.contact_name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Telefone:</div>
            <div>${order.contact_phone}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Data de Início:</div>
            <div>${new Date(order.start_datetime).toLocaleString("pt-BR")}</div>
          </div>
          ${order.completion_datetime ? `
          <div class="info-item">
            <div class="info-label">Data de Conclusão:</div>
            <div>${new Date(order.completion_datetime).toLocaleString("pt-BR")}</div>
          </div>
          ` : ''}
        </div>
      </div>

      ${technician ? `
      <div class="section">
        <h3>Técnico Responsável</h3>
        <div class="info-item">
          <div class="info-label">Nome:</div>
          <div>${technician.name}</div>
        </div>
      </div>
      ` : ''}

      <div class="section">
        <h3>Descrição do Problema</h3>
        <div>${order.problem_description}</div>
      </div>

      ${order.service_description ? `
      <div class="section">
        <h3>Descrição do Serviço Realizado</h3>
        <div>${order.service_description}</div>
      </div>
      ` : ''}

      ${partsReplaced.length > 0 ? `
      <div class="section">
        <h3>Peças Substituídas</h3>
        <table class="parts-table">
          <thead>
            <tr>
              <th>Peça Antiga</th>
              <th>Peça Nova</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${partsReplaced.map(part => `
              <tr>
                <td>${part.old_part}</td>
                <td>${part.new_part}</td>
                <td>${part.part_value ? `R$ ${part.part_value.toFixed(2)}` : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${order.total_value && order.total_value > 0 ? `
      <div class="section">
        <h3>Valor Total</h3>
        <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Total do Serviço</div>
          <div style="font-size: 32px; font-weight: bold; color: #2563eb;">R$ ${order.total_value.toFixed(2)}</div>
        </div>
      </div>
      ` : ''}

      ${order.internal_notes ? `
      <div class="section">
        <h3>Observações Internas</h3>
        <div>${order.internal_notes}</div>
      </div>
      ` : ''}

      ${signature ? `
      <div class="section">
        <h3>Assinatura do Cliente</h3>
        <div class="signature">
          <img src="${signature.signature_data}" alt="Assinatura do Cliente" />
          <div>Assinado em: ${new Date(signature.signed_at).toLocaleString("pt-BR")}</div>
        </div>
      </div>
      ` : ''}

      <div class="footer">
        <div>Relatório gerado em: ${new Date().toLocaleString("pt-BR")}</div>
        <div>RM Refrigeração - Sistema de Ordens de Serviço</div>
      </div>
    `;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-8">
        <p>Erro ao carregar dados do relatório</p>
        <Button onClick={onClose} className="mt-4">Fechar</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">RM Refrigeração</h1>
        <h2 className="text-xl font-semibold mt-2">Relatório de Serviço</h2>
        <p className="text-lg font-medium">OS #{order.os_number}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6 no-print">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
        <Button onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Baixar PDF
        </Button>
        <Button onClick={onClose} variant="outline">
          Fechar
        </Button>
      </div>

      {/* Client Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
              <p className="font-medium">{order.client_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge className={getStatusColor(order.status)}>
                  <span className="mr-1">{getStatusIcon(order.status)}</span>
                  {order.status}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Local</Label>
              <p className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {order.location}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Contato</Label>
              <p className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {order.contact_name}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
              <p className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {order.contact_phone}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Data de Início</Label>
              <p className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(order.start_datetime).toLocaleString("pt-BR")}
              </p>
            </div>
            {order.completion_datetime && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Data de Conclusão</Label>
                <p className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.completion_datetime).toLocaleString("pt-BR")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technician Information */}
      {technician && (
        <Card className="mb-6">
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

      {/* Problem Description */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Descrição do Problema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{order.problem_description}</p>
        </CardContent>
      </Card>

      {/* Service Description */}
      {order.service_description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Descrição do Serviço Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{order.service_description}</p>
          </CardContent>
        </Card>
      )}

      {/* Parts Replaced */}
      {partsReplaced.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Peças Substituídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {partsReplaced.map((part) => (
                <div key={part.id} className="p-3 bg-muted rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">De: {part.old_part}</p>
                      <p className="text-sm text-muted-foreground">Para: {part.new_part}</p>
                      {part.part_value && (
                        <p className="text-sm font-semibold text-primary mt-1">
                          Valor: R$ {part.part_value.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Value */}
      {order.total_value && order.total_value > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 bg-primary/10 rounded-lg">
              <span className="text-lg font-semibold">Total do Serviço:</span>
              <span className="text-3xl font-bold text-primary">
                R$ {order.total_value.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Internal Notes */}
      {order.internal_notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Observações Internas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{order.internal_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Signature */}
      {signature && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Assinatura do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <img 
                src={signature.signature_data} 
                alt="Assinatura do Cliente" 
                className="max-w-xs mx-auto border rounded"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Assinado em: {new Date(signature.signed_at).toLocaleString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground mt-8 pt-4 border-t">
        <p>Relatório gerado em: {new Date().toLocaleString("pt-BR")}</p>
        <p>RM Refrigeração - Sistema de Ordens de Serviço</p>
      </div>
    </div>
  );
};

export default ServiceReport;
