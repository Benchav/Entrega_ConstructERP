// src/pages/GestionCalidad.tsx
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
import { InspeccionCalidad, Proyecto } from '@/data/models'; // Importar ambos modelos
import apiClient from '@/lib/api'; // Importar API Client
import { Plus, Pencil, Trash2, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Definición de tipo para el formulario
type InspeccionFormData = {
  proyectoId: string;
  fecha: string;
  fase: string;
  resultado: string;
  observaciones: string;
};

// --- Mover estado inicial fuera ---
const initialFormData: InspeccionFormData = {
  proyectoId: '',
  fecha: new Date().toISOString().split('T')[0],
  fase: '',
  resultado: 'Aprobado',
  observaciones: '',
};

// ====================================================================
// 1. EXTRAER EL FORMULARIO A SU PROPIO COMPONENTE
// ====================================================================
interface InspeccionFormProps {
  formData: InspeccionFormData;
  setFormData: React.Dispatch<React.SetStateAction<InspeccionFormData>>;
  proyectos: Proyecto[];
}

const InspeccionForm = React.memo(({ formData, setFormData, proyectos }: InspeccionFormProps) => {

  // 2. CREAR MANEJADORES DE CAMBIO ESTABLES
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof InspeccionFormData) => (value: string) => {
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
        <div>
          <Label htmlFor="fase">Fase de Inspección</Label>
          <Input
            id="fase"
            value={formData.fase}
            onChange={handleInputChange}
            placeholder="Ej: Fundición de Losa Nivel 2"
          />
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
              <Label htmlFor="resultado">Resultado</Label>
              <Select 
                value={formData.resultado} 
                onValueChange={handleSelectChange('resultado')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aprobado">Aprobado</SelectItem>
                  <SelectItem value="Con Observaciones">Con Observaciones</SelectItem>
                  <SelectItem value="Rechazado">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>
        <div>
          <Label htmlFor="observaciones">Observaciones / Detalles</Label>
          <Textarea
            id="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            placeholder="Describa los hallazgos y el cumplimiento de especificaciones."
            rows={4}
          />
        </div>
      </div>
  );
});

// ====================================================================
// 3. COMPONENTE PRINCIPAL (Ahora más limpio)
// ====================================================================
const GestionCalidad = () => {
  // --- Estados de Datos (API) ---
  const [inspecciones, setInspecciones] = useState<InspeccionCalidad[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de UI (CRUD, Búsqueda) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingInspeccion, setEditingInspeccion] = useState<InspeccionCalidad | null>(null);

  // --- Estados para Diálogos ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState<InspeccionFormData>(initialFormData);

  // --- Carga de Datos (API) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [inspeccionesRes, proyectosRes] = await Promise.all([
          apiClient.get<InspeccionCalidad[]>('/inspeccionesCalidad'),
          apiClient.get<Proyecto[]>('/proyectos'), // Para el dropdown
        ]);
        
        setInspecciones(Array.isArray(inspeccionesRes.data) ? inspeccionesRes.data : []);
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
  const filteredInspecciones = inspecciones.filter(i =>
    (i.fase?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (i.observaciones?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (getProjectName(i.proyectoId)?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );

  const resultadosCriticos = inspecciones.filter(i => i.resultado !== 'Aprobado').length;
  const totalAprobadas = inspecciones.filter(i => i.resultado === 'Aprobado').length;

  const renderResultadoBadge = (resultado: InspeccionCalidad['resultado']) => {
    let variant: 'default' | 'destructive' | 'outline' = 'outline';
    let className = '';

    switch (resultado) {
      case 'Aprobado':
        variant = 'default';
        className = 'bg-success text-success-foreground hover:bg-success/80';
        break;
      case 'Con Observaciones':
        variant = 'default';
        className = 'bg-warning text-warning-foreground hover:bg-warning/80';
        break;
      case 'Rechazado':
        variant = 'destructive';
        break;
    }
    return <Badge variant={variant} className={className}>{resultado}</Badge>;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingInspeccion(null);
  };

  const handleCreateOpenChange = (open: boolean) => {
    if (open) resetForm();
    setIsCreateOpen(open);
  };

  const handleEditOpenChange = (open: boolean) => {
    if (!open) { setEditingInspeccion(null); resetForm(); }
    setIsEditOpen(open);
  };

  // --- Lógica CRUD (API) ---

  const handleCreate = async () => {
    if (!formData.proyectoId || !formData.fase || !formData.observaciones) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const newInspeccionPayload = {
      proyectoId: parseInt(formData.proyectoId),
      fecha: formData.fecha,
      fase: formData.fase,
      resultado: formData.resultado as InspeccionCalidad["resultado"],
      observaciones: formData.observaciones,
    };

    try {
      const res = await apiClient.post<InspeccionCalidad>('/inspeccionesCalidad', newInspeccionPayload);
      setInspecciones([...inspecciones, res.data]);
      handleCreateOpenChange(false);
      toast.success('Inspección de Calidad registrada exitosamente');
    } catch (error) {
      toast.error('Error al registrar la inspección');
      console.error(error);
    }
  };

  const handleEdit = (inspeccion: InspeccionCalidad) => {
    setEditingInspeccion(inspeccion);
    setFormData({
      proyectoId: String(inspeccion.proyectoId),
      fecha: inspeccion.fecha ? inspeccion.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
      fase: inspeccion.fase,
      resultado: inspeccion.resultado,
      observaciones: inspeccion.observaciones,
    });
    handleEditOpenChange(true);
  };

  const handleUpdate = async () => {
    if (!editingInspeccion || !formData.proyectoId || !formData.fase || !formData.observaciones) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const updatedInspeccionPayload = {
      proyectoId: parseInt(formData.proyectoId),
      fecha: formData.fecha,
      fase: formData.fase,
      resultado: formData.resultado as InspeccionCalidad["resultado"],
      observaciones: formData.observaciones,
    };

    try {
      const res = await apiClient.put<InspeccionCalidad>(`/inspeccionesCalidad/${editingInspeccion.id}`, updatedInspeccionPayload);
      setInspecciones(inspecciones.map(i => (i.id === editingInspeccion.id ? res.data : i)));
      handleEditOpenChange(false);
      toast.success('Inspección de Calidad actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar la inspección');
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
      await apiClient.delete(`/inspeccionesCalidad/${deletingId}`);
      setInspecciones(inspecciones.filter(i => i.id !== deletingId));
      toast.success('Inspección de Calidad eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la inspección');
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Control de Calidad en Obra</h1>
            <p className="text-muted-foreground">Registro y seguimiento de inspecciones de fases constructivas</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Inspección
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Inspección</DialogTitle>
              </DialogHeader>
              {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
              <InspeccionForm
                formData={formData}
                setFormData={setFormData}
                proyectos={proyectos}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Registrar Inspección</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Total Aprobadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">{totalAprobadas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Observaciones/Rechazos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{resultadosCriticos}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Inspecciones</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por fase o proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando inspecciones...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Fase</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead className='w-1/3'>Observaciones</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInspecciones.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>{i.fecha ? new Date(i.fecha).toLocaleDateString('es-ES') : "N/A"}</TableCell>
                        <TableCell>{getProjectName(i.proyectoId)}</TableCell>
                        <TableCell className="font-medium">{i.fase}</TableCell>
                        <TableCell>{renderResultadoBadge(i.resultado)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={i.observaciones}>{i.observaciones}</TableCell>
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
              <DialogTitle>Editar Inspección</DialogTitle>
            </DialogHeader>
            {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
            <InspeccionForm
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
                el registro de la inspección.
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

export default GestionCalidad;