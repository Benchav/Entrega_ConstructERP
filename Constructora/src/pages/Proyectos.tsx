import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Proyecto } from '@/data/models';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { MapPin, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Proyectos = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProyectos = async () => {
      setLoading(true);
      try {
        // CORREGIDO: Tipar la respuesta de la API
        const res = await apiClient.get<Proyecto[]>('/proyectos');
        setProyectos(res.data);
      } catch (error) {
        toast.error('No se pudieron cargar los proyectos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Todos los Proyectos</h1>
          <p className="text-muted-foreground">Gestión completa de proyectos en desarrollo</p>
        </div>

        {loading ? (
          <p>Cargando proyectos...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {proyectos.map((proyecto) => (
              <Card
                key={proyecto.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary"
                onClick={() => navigate(`/proyecto/${proyecto.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{proyecto.nombre}</CardTitle>
                    <Badge
                      variant={proyecto.estado === 'En Curso' ? 'default' : 'secondary'}
                      className={proyecto.estado === 'En Curso' ? 'bg-success' : ''}
                    >
                      {proyecto.estado}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" />
                    <span>{proyecto.ubicacion}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Avance</span>
                      <span className="text-sm font-bold text-foreground">{proyecto.avance}%</span>
                    </div>
                    <Progress value={proyecto.avance} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Presupuesto</p>
                      <p className="text-lg font-bold text-primary">
                        ${(proyecto.presupuesto / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-success flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        En desarrollo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Proyectos;