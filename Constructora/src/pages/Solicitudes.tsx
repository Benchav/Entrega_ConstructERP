import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SolicitudMaterial, SolicitudDinero, Proyecto } from '@/data/models'; // Importar modelos
import apiClient from '@/lib/api'; // Importar API Client
import { CheckCircle, XCircle, Clock, Package, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

// Definir los tipos de estado explícitamente
type SolicitudEstado = "Pendiente" | "Aprobada" | "Rechazada";

const Solicitudes = () => {
  // --- Estados de Datos (API) ---
  const [solicitudesMateriales, setSolicitudesMateriales] = useState<SolicitudMaterial[]>([]);
  const [solicitudesDinero, setSolicitudesDinero] = useState<SolicitudDinero[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Carga de Datos (API) ---
  useEffect(() => {
    const fetchSolicitudes = async () => {
      setLoading(true);
      try {
        const [resMateriales, resDinero, resProyectos] = await Promise.all([
          apiClient.get<SolicitudMaterial[]>('/solicitudesMateriales'),
          apiClient.get<SolicitudDinero[]>('/solicitudesDinero'),
          apiClient.get<Proyecto[]>('/proyectos')
        ]);
        
        setSolicitudesMateriales(Array.isArray(resMateriales.data) ? resMateriales.data : []);
        setSolicitudesDinero(Array.isArray(resDinero.data) ? resDinero.data : []);
        setProyectos(Array.isArray(resProyectos.data) ? resProyectos.data : []);

      } catch (error) {
        toast.error('No se pudieron cargar las solicitudes');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitudes();
  }, []);

  // --- Helper de Proyecto (usa estado 'proyectos') ---
  const getProjectName = (proyectoId: number) => {
    const proyecto = proyectos.find(p => p.id === proyectoId);
    return proyecto ? proyecto.nombre : `ID: ${proyectoId}`;
  };

  // --- Lógica de Aprobación (API) ---
  const handleUpdateMaterial = async (id: string | number, nuevoEstado: SolicitudEstado) => {
    // 1. Encontrar la solicitud original (comparando como string para evitar problemas de tipo)
    const solicitudOriginal = solicitudesMateriales.find(s => String(s.id) === String(id));
    if (!solicitudOriginal) {
      toast.error("No se encontró la solicitud para actualizar.");
      return;
    }

    // 2. Crear el payload completo
    const payload: SolicitudMaterial = { ...solicitudOriginal, estado: nuevoEstado };

    try {
      // 3. Usar apiClient.put con el payload completo
      const res = await apiClient.put<SolicitudMaterial>(`/solicitudesMateriales/${id}`, payload);
      
      setSolicitudesMateriales(prev => 
        prev.map(s => (String(s.id) === String(id) ? res.data : s))
      );
      toast.success(`Solicitud de material ${nuevoEstado.toLowerCase()}`);
    } catch (error) {
      toast.error('Error al actualizar la solicitud de material');
      console.error(error);
    }
  };

  const handleUpdateDinero = async (id: string | number, nuevoEstado: SolicitudEstado) => {
    // 1. Encontrar la solicitud original (comparando como string para evitar problemas de tipo)
    const solicitudOriginal = solicitudesDinero.find(s => String(s.id) === String(id));
    if (!solicitudOriginal) {
      toast.error("No se encontró la solicitud para actualizar.");
      return;
    }

    // 2. Crear el payload completo
    const payload: SolicitudDinero = { ...solicitudOriginal, estado: nuevoEstado };
    
    try {
      // 3. Usar apiClient.put con el payload completo
      const res = await apiClient.put<SolicitudDinero>(`/solicitudesDinero/${id}`, payload);

      setSolicitudesDinero(prev => 
        prev.map(s => (String(s.id) === String(id) ? res.data : s))
      );
      toast.success(`Solicitud de dinero ${nuevoEstado.toLowerCase()}`);
    } catch (error) {
      toast.error('Error al actualizar la solicitud de dinero');
      console.error(error);
    }
  };

  // --- KPIs (calculados desde el estado) ---
  const materialesPendientes = solicitudesMateriales.filter(s => s.estado === 'Pendiente').length;
  const dineroPendiente = solicitudesDinero.filter(s => s.estado === 'Pendiente').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Solicitudes</h1>
          <p className="text-muted-foreground">Apruebe o rechace solicitudes de materiales y dinero</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                Solicitudes de Materiales Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{materialesPendientes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                Solicitudes de Dinero Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{dineroPendiente}</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <p>Cargando solicitudes...</p>
        ) : (
          <Tabs defaultValue="materiales">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="materiales" className="gap-2">
                <Package className="h-4 w-4" />
                Materiales
                {materialesPendientes > 0 && (
                  <Badge variant="destructive" className="ml-2">{materialesPendientes}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="dinero" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Dinero
                {dineroPendiente > 0 && (
                  <Badge variant="destructive" className="ml-2">{dineroPendiente}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Pestaña de Materiales */}
            <TabsContent value="materiales" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes de Materiales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Proyecto</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Solicitante</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {solicitudesMateriales.map((solicitud) => (
                          <TableRow key={solicitud.id}>
                            <TableCell>{solicitud.fecha ? new Date(solicitud.fecha).toLocaleDateString('es-ES') : '-'}</TableCell>
                            <TableCell>
                              {getProjectName(solicitud.proyectoId)}
                            </TableCell>
                            <TableCell className="font-medium">{solicitud.item}</TableCell>
                            <TableCell className="font-bold">{solicitud.cantidad}</TableCell>
                            <TableCell>{solicitud.solicitante}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  solicitud.estado === 'Pendiente' ? 'default' :
                                  solicitud.estado === 'Aprobada' ? 'secondary' : 'destructive'
                                }
                                className={
                                  solicitud.estado === 'Pendiente' ? 'bg-warning text-warning-foreground' :
                                  solicitud.estado === 'Aprobada' ? 'bg-success text-success-foreground' : ''
                                }
                              >
                                {solicitud.estado === 'Pendiente' && <Clock className="h-3 w-3 mr-1" />}
                                {solicitud.estado === 'Aprobada' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {solicitud.estado === 'Rechazada' && <XCircle className="h-3 w-3 mr-1" />}
                                {solicitud.estado}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {solicitud.estado === 'Pendiente' && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1"
                                    onClick={() => handleUpdateMaterial(solicitud.id, 'Aprobada')}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    Aprobar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="gap-1"
                                    onClick={() => handleUpdateMaterial(solicitud.id, 'Rechazada')}
                                  >
                                    <XCircle className="h-3 w-3" />
                                    Rechazar
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña de Dinero */}
            <TabsContent value="dinero" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes de Dinero</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Proyecto</TableHead>
                          <TableHead>Motivo</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Solicitante</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {solicitudesDinero.map((solicitud) => (
                          <TableRow key={solicitud.id}>
                            <TableCell>{solicitud.fecha ? new Date(solicitud.fecha).toLocaleDateString('es-ES') : '-'}</TableCell>
                            <TableCell>
                              {getProjectName(solicitud.proyectoId)}
                            </TableCell>
                            <TableCell className="font-medium">{solicitud.motivo}</TableCell>
                            <TableCell className="font-bold text-success">
                              ${(Number(solicitud.monto) || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>{solicitud.solicitante}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  solicitud.estado === 'Pendiente' ? 'default' :
                                  solicitud.estado === 'Aprobada' ? 'secondary' : 'destructive'
                                }
                                className={
                                  solicitud.estado === 'Pendiente' ? 'bg-warning text-warning-foreground' :
                                  solicitud.estado === 'Aprobada' ? 'bg-success text-success-foreground' : ''
                                }
                              >
                                {solicitud.estado === 'Pendiente' && <Clock className="h-3 w-3 mr-1" />}
                                {solicitud.estado === 'Aprobada' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {solicitud.estado === 'Rechazada' && <XCircle className="h-3 w-3 mr-1" />}
                                {solicitud.estado}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {solicitud.estado === 'Pendiente' && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1"
                                    onClick={() => handleUpdateDinero(solicitud.id, 'Aprobada')}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    Aprobar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="gap-1"
                                    onClick={() => handleUpdateDinero(solicitud.id, 'Rechazada')}
                                  >
                                    <XCircle className="h-3 w-3" />
                                    Rechazar
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Solicitudes;