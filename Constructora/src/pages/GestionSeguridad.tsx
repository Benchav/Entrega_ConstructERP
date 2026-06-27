// src/pages/GestionSeguridad.tsx
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription, // Importado para el modal de borrado
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IncidenteSeguridad, Proyecto } from '@/data/models'; // Importar ambos modelos
import apiClient from '@/lib/api'; // Importar API Client
import { Plus, Pencil, Trash2, Search, AlertTriangle, User, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Definición de tipo para el formulario
type IncidenteFormData = {
  proyectoId: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  responsable: string;
};

// --- Mover estado inicial fuera para acceso global ---
const initialFormData: IncidenteFormData = {
  proyectoId: '',
  fecha: new Date().toISOString().split('T')[0],
  tipo: 'Incidente',
  descripcion: '',
  responsable: '',
};

// ====================================================================
// 1. EXTRAER EL FORMULARIO A SU PROPIO COMPONENTE
// ====================================================================
interface IncidenteFormProps {
  formData: IncidenteFormData;
  setFormData: React.Dispatch<React.SetStateAction<IncidenteFormData>>;
  proyectos: Proyecto[];
}

const IncidenteForm = React.memo(({ formData, setFormData, proyectos }: IncidenteFormProps) => {
  
  // 2. CREAR MANEJADORES DE CAMBIO ESTABLES
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof IncidenteFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="proyecto">Proyecto</Label>
        <Select 
          value={formData.proyectoId} 
          onValueChange={handleSelectChange('proyectoId')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione proyecto" />
          </SelectTrigger>
          <SelectContent>
            {proyectos.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fecha">Fecha</Label>
          <Input
            id="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="tipo">Tipo de Evento</Label>
          <Select 
            value={formData.tipo} 
            onValueChange={handleSelectChange('tipo')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Accidente">Accidente</SelectItem>
              <SelectItem value="Incidente">Incidente</SelectItem>
              <SelectItem value="Inspección">Inspección</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="responsable">Reportado / Responsable</Label>
        <Input
          id="responsable"
          value={formData.responsable}
          onChange={handleInputChange}
          placeholder="Ej: Jefe de Obra Juan Pérez"
        />
      </div>
      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          placeholder="Detalle del evento, causas y acciones tomadas."
          rows={4}
        />
      </div>
    </div>
  );
});

// ====================================================================
// 3. COMPONENTE PRINCIPAL (Ahora más limpio)
// ====================================================================
const GestionSeguridad = () => {
  // --- Estados de Datos (API) ---
  const [incidentes, setIncidentes] = useState<IncidenteSeguridad[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de UI (CRUD, Búsqueda) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIncidente, setEditingIncidente] = useState<IncidenteSeguridad | null>(null);

  // --- Estados para Diálogos ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState<IncidenteFormData>(initialFormData);

  // --- Carga de Datos (API) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [incidentesRes, proyectosRes] = await Promise.all([
          apiClient.get<IncidenteSeguridad[]>('/incidentesSeguridad'),
          apiClient.get<Proyecto[]>('/proyectos'), // Para el dropdown
        ]);
        
        setIncidentes(Array.isArray(incidentesRes.data) ? incidentesRes.data : []);
        setProyectos(Array.isArray(proyectosRes.data) ? proyectosRes.data : []);

      } catch (error) {
        toast.error('No se pudieron cargar los datos');
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Helper (movido adentro para acceder al estado 'proyectos') ---
  const getProjectName = (proyectoId: number) => {
    if (!proyectos || proyectos.length === 0) return 'N/A';
    return proyectos.find(p => p.id === proyectoId)?.nombre || 'N/A';
  }

  // --- Lógica de UI (Filtros, KPIs) ---
  const filteredIncidentes = incidentes.filter(i =>
    (i.descripcion?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (i.responsable?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );

  const accidentesCount = incidentes.filter(i => i.tipo === 'Accidente').length;
  const inspeccionesCount = incidentes.filter(i => i.tipo === 'Inspección').length;

  const renderTipoBadge = (tipo: IncidenteSeguridad['tipo']) => {
    let variant: 'default' | 'destructive' | 'secondary' = 'secondary';
    let icon: React.ReactNode;
    let className = '';

    switch (tipo) {
      case 'Accidente':
        variant = 'destructive';
        icon = <AlertTriangle className="h-3 w-3 mr-1" />;
        break;
      case 'Incidente':
        variant = 'default';
        className = 'bg-warning text-warning-foreground hover:bg-warning/80' // Color Naranja/Amarillo
        icon = <AlertTriangle className="h-3 w-3 mr-1" />;
        break;
      case 'Inspección':
        variant = 'secondary';
        className = 'bg-primary text-primary-foreground hover:bg-primary/80' // Color Azul
        icon = <ClipboardList className="h-3 w-3 mr-1" />;
        break;
    }
    return <Badge variant={variant} className={className}>{icon}{tipo}</Badge>;
  };


  const resetForm = () => {
    setFormData(initialFormData);
    setEditingIncidente(null);
  };

  const handleCreateOpenChange = (open: boolean) => {
    if (open) resetForm();
    setIsCreateOpen(open);
  };

  const handleEditOpenChange = (open: boolean) => {
    if (!open) { setEditingIncidente(null); resetForm(); }
    setIsEditOpen(open);
  };

  // --- Lógica CRUD (API) ---

  const handleCreate = async () => {
    if (!formData.proyectoId || !formData.descripcion || !formData.responsable) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const newIncidentePayload = {
      proyectoId: parseInt(formData.proyectoId),
      fecha: formData.fecha,
      tipo: formData.tipo as IncidenteSeguridad["tipo"],
      descripcion: formData.descripcion,
      responsable: formData.responsable,
    };

    try {
      const res = await apiClient.post<IncidenteSeguridad>('/incidentesSeguridad', newIncidentePayload);
      setIncidentes([...incidentes, res.data]);
      handleCreateOpenChange(false);
      toast.success('Registro de Seguridad creado exitosamente');
    } catch (error) {
      toast.error('Error al registrar el evento');
      console.error(error);
    }
  };

  const handleEdit = (incidente: IncidenteSeguridad) => {
    setEditingIncidente(incidente);
    setFormData({
      proyectoId: String(incidente.proyectoId),
      fecha: incidente.fecha ? incidente.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
      tipo: incidente.tipo,
      descripcion: incidente.descripcion,
      responsable: incidente.responsable,
    });
    handleEditOpenChange(true);
  };

  const handleUpdate = async () => {
    if (!editingIncidente || !formData.proyectoId || !formData.descripcion || !formData.responsable) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const updatedIncidentePayload = {
      proyectoId: parseInt(formData.proyectoId),
      fecha: formData.fecha,
      tipo: formData.tipo as IncidenteSeguridad["tipo"],
      descripcion: formData.descripcion,
      responsable: formData.responsable,
    };

    try {
      const res = await apiClient.put<IncidenteSeguridad>(`/incidentesSeguridad/${editingIncidente.id}`, updatedIncidentePayload);
      setIncidentes(incidentes.map(i => (i.id === editingIncidente.id ? res.data : i)));
      handleEditOpenChange(false);
      toast.success('Registro de Seguridad actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el evento');
      console.error(error);
    }
  };

  const openDeleteDialog = (id: string | number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await apiClient.delete(`/incidentesSeguridad/${deletingId}`);
      setIncidentes(incidentes.filter(i => i.id !== deletingId));
      toast.success('Registro de Seguridad eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el registro');
    } finally {
      setIsDeleteOpen(false);
      setDeletingId(null);
    }
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Seguridad Ocupacional</h1>
            <p className="text-muted-foreground">Registro de incidentes, accidentes e inspecciones de seguridad</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Evento de Seguridad</DialogTitle>
              </DialogHeader>
              {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
              <IncidenteForm
                formData={formData}
                setFormData={setFormData}
                proyectos={proyectos}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Registrar Evento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Total Accidentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{accidentesCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                Inspecciones Registradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{inspeccionesCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Eventos de Seguridad</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción o responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando registros...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead className='w-1/3'>Descripción</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidentes.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>{i.fecha ? new Date(i.fecha).toLocaleDateString('es-ES') : "N/A"}</TableCell>
                        <TableCell>{getProjectName(i.proyectoId)}</TableCell>
                        <TableCell>{renderTipoBadge(i.tipo)}</TableCell>
                        <TableCell className="font-medium">{i.responsable}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={i.descripcion}>{i.descripcion}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(i)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => openDeleteDialog(i.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Edición */}
        <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Evento de Seguridad</DialogTitle>
            </DialogHeader>
            {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
            <IncidenteForm
              formData={formData}
              setFormData={setFormData}
              proyectos={proyectos}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => handleEditOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleUpdate}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Modal de Confirmar Borrado */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Está seguro?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente
                el registro de seguridad.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
};

export default GestionSeguridad;