import { useState } from "react";
import { orderPhotosAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PhotoUploadProps {
  orderId: string;
  photoType: "problem" | "solution";
  photos: Array<{ id: string; photo_url: string }>;
  onPhotosChange: () => void;
  title: string;
  description: string;
}

const PhotoUpload = ({
  orderId,
  photoType,
  photos,
  onPhotosChange,
  title,
  description,
}: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Validar tamanho do arquivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
        return;
      }

      // Validar tipo MIME
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou HEIC");
        return;
      }

      // Upload usando a API
      await orderPhotosAPI.upload(orderId, file, photoType, 'image');

      toast.success("Foto enviada com sucesso!");
      onPhotosChange();
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || "Erro desconhecido ao enviar foto";
      toast.error(`Erro ao enviar foto: ${errorMessage}`);
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  const deletePhoto = async (photoId: string, photoUrl: string) => {
    try {
      await orderPhotosAPI.delete(orderId, photoId);
      toast.success("Foto removida com sucesso!");
      onPhotosChange();
    } catch (error: any) {
      console.error("Erro ao remover foto:", error);
      toast.error("Erro ao remover foto: " + (error.message || "Erro desconhecido"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.photo_url}
                alt="Foto"
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deletePhoto(photo.id, photo.photo_url)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={uploadPhoto}
            disabled={uploading}
            className="hidden"
            id={`photo-upload-${photoType}`}
          />
          <label htmlFor={`photo-upload-${photoType}`}>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              asChild
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Adicionar Foto
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;
