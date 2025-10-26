import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Video, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  photo_url: string;
  media_type: string;
  duration_seconds?: number;
}

interface MediaUploadProps {
  orderId: string;
  photoType: "problem" | "solution";
  media: MediaItem[];
  onMediaChange: () => void;
  title: string;
  description: string;
}

const MediaUpload = ({
  orderId,
  photoType,
  media,
  onMediaChange,
  title,
  description,
}: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const validateVideo = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = Math.floor(video.duration);
        
        if (duration > 60) {
          reject(new Error("O vídeo deve ter no máximo 60 segundos"));
        } else {
          resolve(duration);
        }
      };

      video.onerror = () => {
        reject(new Error("Erro ao carregar vídeo"));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const uploadMedia = async (event: React.ChangeEvent<HTMLInputElement>, mediaType: "image" | "video") => {
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
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
      const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
      
      if (mediaType === "image" && !allowedImageTypes.includes(file.type)) {
        toast.error("Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou HEIC");
        return;
      }
      
      if (mediaType === "video" && !allowedVideoTypes.includes(file.type)) {
        toast.error("Tipo de vídeo não suportado. Use MP4, QuickTime ou WebM");
        return;
      }

      let duration: number | undefined;

      // Validate video duration
      if (mediaType === "video") {
        try {
          duration = await validateVideo(file);
        } catch (error: any) {
          toast.error(error.message);
          return;
        }
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${orderId}/${fileName}`;

      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from("order-photos")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("order-photos")
        .getPublicUrl(filePath);

      // Inserir no banco de dados
      const { error: dbError } = await supabase
        .from("order_photos")
        .insert({
          order_id: orderId,
          photo_url: publicUrl,
          photo_type: photoType,
          media_type: mediaType,
          duration_seconds: duration,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Erro no banco de dados: ${dbError.message}`);
      }

      toast.success(mediaType === "image" ? "Foto enviada com sucesso!" : "Vídeo enviado com sucesso!");
      onMediaChange();
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || "Erro desconhecido ao enviar arquivo";
      toast.error(`Erro ao enviar: ${errorMessage}`);
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  const deleteMedia = async (mediaId: string, mediaUrl: string) => {
    try {
      const filePath = mediaUrl.split("/order-photos/")[1];
      
      const { error: storageError } = await supabase.storage
        .from("order-photos")
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("order_photos")
        .delete()
        .eq("id", mediaId);

      if (dbError) throw dbError;

      toast.success("Mídia removida com sucesso!");
      onMediaChange();
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message);
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
          {media.map((item) => (
            <div key={item.id} className="relative group">
              {item.media_type === "video" ? (
                <div className="relative">
                  <video
                    src={item.photo_url}
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {item.duration_seconds}s
                  </div>
                </div>
              ) : (
                <img
                  src={item.photo_url}
                  alt="Foto"
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteMedia(item.id, item.photo_url)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Photo Upload */}
          <div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => uploadMedia(e, "image")}
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
                      Foto
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>

          {/* Video Upload */}
          <div>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              capture="environment"
              onChange={(e) => uploadMedia(e, "video")}
              disabled={uploading}
              className="hidden"
              id={`video-upload-${photoType}`}
            />
            <label htmlFor={`video-upload-${photoType}`}>
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
                      <Video className="w-4 h-4 mr-2" />
                      Vídeo
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Vídeos: máximo 60 segundos
        </p>
      </CardContent>
    </Card>
  );
};

export default MediaUpload;
