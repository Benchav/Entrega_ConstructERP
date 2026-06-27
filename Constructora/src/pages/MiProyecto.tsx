import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { Proyecto, InventarioItem, Empleado, Plano } from '@/data/models';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import {
  MapPin,
  Users,
  Package,
  FileText,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MiProyecto = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMiProyecto = async () => {
      const proyectoId = user?.proyectoAsignadoId;

      if (!proyectoId) {
        setProyecto(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [proyectoRes, inventarioRes, empleadosRes, planosRes] = await Promise.allSettled([
          apiClient.get<Proyecto>(`/proyectos/${proyectoId}`),
          apiClient.get<InventarioItem[]>('/inventario'),
          apiClient.get<Empleado[]>('/empleados'),
          apiClient.get<Plano[]>('/planos'),
        ]);

        // Proyecto principal
        if (proyectoRes.status === "fulfilled" && proyectoRes.value.data) {
          setProyecto(proyectoRes.value.data);
        } else {
          toast.warning("No se pudo cargar la información del proyecto.");
          setProyecto(null);
        }

        // Inventario filtrado
        if (inventarioRes.status === "fulfilled" && Array.isArray(inventarioRes.value.data)) {
          setInventario(inventarioRes.value.data.filter(i => i.proyectoId === proyectoId));
        } else {
          setInventario([]);
        }

        // Empleados filtrados
        if (empleadosRes.status === "fulfilled" && Array.isArray(empleadosRes.value.data)) {
          setEmpleados(empleadosRes.value.data.filter(e => e.proyectoAsignadoId === proyectoId));
        } else {
          setEmpleados([]);
        }

        // Planos filtrados
        if (planosRes.status === "fulfilled" && Array.isArray(planosRes.value.data)) {
          setPlanos(planosRes.value.data.filter(p => p.proyectoId === proyectoId));
        } else {
          setPlanos([]);
        }

        // Si todo falló
        if (
          proyectoRes.status === "rejected" &&
          inventarioRes.status === "rejected" &&
          empleadosRes.status === "rejected" &&
          planosRes.status === "rejected"
        ) {
          throw new Error("No se pudieron obtener los datos del proyecto.");
        }

      } catch (err) {
        console.error("❌ Error al cargar datos del proyecto:", err);
        toast.error("Error al cargar la información del proyecto.");
        setError("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMiProyecto();
  }, [user]);

  // Estados intermedios
  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground p-6">Cargando datos de “Mi Proyecto”...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-red-500 mb-2">Ocurrió un error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!proyecto) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">No tiene proyecto asignado</h2>
          <p className="text-muted-foreground">
            Contacte al administrador para que le asigne un proyecto.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Vista principal del proyecto
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header del Proyecto */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {proyecto.nombre || "Proyecto sin nombre"}
                </h1>
                <Badge variant={proyecto.estado === 'En Curso' ? 'default' : 'secondary'}>
                  {proyecto.estado || "Sin estado"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{proyecto.ubicacion || "Ubicación no especificada"}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avance</p>
                <p className="text-2xl font-bold text-primary">{proyecto.avance ?? 0}%</p>
              </div>
            </div>
          </div>
          <Progress value={proyecto.avance ?? 0} className="mt-4 h-3" />
        </div>

        {/* Resumen de Recursos */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Personal Asignado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{empleados.length}</p>
              <p className="text-xs text-muted-foreground mt-1">empleados activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                Items en Inventario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{inventario.length}</p>
              <p className="text-xs text-muted-foreground mt-1">tipos de materiales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-chart-3" />
                Planos Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{planos.length}</p>
              <p className="text-xs text-muted-foreground mt-1">documentos técnicos</p>
            </CardContent>
          </Card>
        </div>

        {/* Accesos Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/inventario')}
              >
                <Package className="h-6 w-6 text-accent" />
                <span className="font-semibold">Inventario</span>
                <span className="text-xs text-muted-foreground">Gestionar materiales</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/planos')}
              >
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-semibold">Planos</span>
                <span className="text-xs text-muted-foreground">Ver documentación</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/reportes')}
              >
                <TrendingUp className="h-6 w-6 text-success" />
                <span className="font-semibold">Reportes</span>
                <span className="text-xs text-muted-foreground">Registrar avances</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate(`/solicitudes`)}
              >
                <DollarSign className="h-6 w-6 text-chart-4" />
                <span className="font-semibold">Solicitudes</span>
                <span className="text-xs text-muted-foreground">Pedir material/dinero</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MiProyecto;