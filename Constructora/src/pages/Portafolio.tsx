import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockPortafolioData } from "@/data/mockPortafolio"; 
import { Calendar } from "lucide-react";

const Portafolio = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Portafolio de Proyectos
          </h1>
          <p className="text-muted-foreground">
            Nuestros Proyectos finalizados con su foto y modelación 3D
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {mockPortafolioData.map((proyecto) => (
            <Card key={proyecto.id} className="overflow-hidden flex flex-col">
              <img
                src={proyecto.imageUrl}
                alt={proyecto.nombre}
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <CardTitle>{proyecto.nombre}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                  <Calendar className="h-4 w-4" />
                  Completado: {new Date(proyecto.fechaCompletado).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                </CardDescription>
                <Badge variant="secondary" className="w-fit">{proyecto.ubicacion}</Badge>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground flex-1">
                  {proyecto.descripcion}
                </p>

                {/* Renderizado condicional del modelo 3D */}
                {proyecto.modelo3dUrl && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Modelo 3D Interactivo</h4>
                    <div className="aspect-video w-full overflow-hidden rounded-md border">
                      <iframe
                        title={proyecto.nombre}
                        src={proyecto.modelo3dUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; vr"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Portafolio;