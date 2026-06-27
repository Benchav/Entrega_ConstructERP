import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription, 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReporteDiario, Proyecto } from '@/data/models'; 
import apiClient from '@/lib/api'; 
import { useAuth } from '@/hooks/useAuth'; 
import { Plus, FileText, Calendar, User, Pencil, Trash2 } from 'lucide-react'; 
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';


type ReporteFormData = {
  fecha: string;
  proyectoId: string;
  resumen: string;
};


const initialFormData: ReporteFormData = {
  fecha: new Date().toISOString().split('T')[0],
  proyectoId: '',
  resumen: '',
};

// ====================================================================
// 1. EXTRAER EL FORMULARIO A SU PROPIO COMPONENTE
// ====================================================================
interface ReporteFormProps {
  formData: ReporteFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReporteFormData>>;
  proyectos: Proyecto[];
  proyectoAsignadoId?: number | null;
  isEditMode?: boolean; // Añadir modo edición
}

const ReporteForm = React.memo(({ formData, setFormData, proyectos, proyectoAsignadoId, isEditMode = false }: ReporteFormProps) => {

  // 2. CREAR MANEJADORES DE CAMBIO ESTABLES
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, proyectoId: value }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fecha">Fecha</Label>
        <Input
          id="fecha"
          type="date"
          value={formData.fecha}
          onChange={handleInputChange} // Usar manejador estable
        />
      </div>
      <div>
        <Label htmlFor="proyecto">Proyecto</Label>
        <Select
          value={formData.proyectoId}
          onValueChange={handleSelectChange} // Usar manejador estable
          // Bloquear si está en modo edición O si el usuario tiene un proyecto asignado
          disabled={isEditMode || !!proyectoAsignadoId} 
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione proyecto" />
          </SelectTrigger>
          <SelectContent>
            {/* Mostrar siempre todos los proyectos para que el modo edición funcione,
                el 'disabled' se encarga de la lógica de bloqueo */}
            {proyectos.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="resumen">Resumen de Actividades</Label>
        <Textarea
          id="resumen"
          value={formData.resumen}
          onChange={handleInputChange} // Usar manejador estable
          placeholder="Describa las actividades realizadas, avances, personal presente, materiales utilizados, incidentes, etc."
          rows={8}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.resumen.length} caracteres (mínimo 10)
        </p>
      </div>
    </div>
  );
});

// ====================================================================
// 3. COMPONENTE PRINCIPAL (Ahora con CRUD completo)
// ====================================================================
const GestionReportes = () => {
  const { user } = useAuth();
  
  // --- Estados de Datos (API) ---
  const [reportes, setReportes] = useState<ReporteDiario[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de UI (Modal) ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // <--- NUEVO
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // <--- NUEVO
  
  const [editingReporte, setEditingReporte] = useState<ReporteDiario | null>(null); // <--- NUEVO
  const [deletingId, setDeletingId] = useState<string | number | null>(null); // <--- NUEVO
  
  const [formData, setFormData] = useState<ReporteFormData>(initialFormData);

  // Si el usuario es 'Jefe de Obra' etc, se filtra por su proyecto.
  // Si es 'CEO', 'Director', etc. (sin proyectoAsignadoId), verá todos los reportes.
  const proyectoAsignadoId = user?.proyectoAsignadoId;

  // --- Carga de Datos (API) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reportesRes, proyectosRes] = await Promise.all([
          apiClient.get<ReporteDiario[]>('/reportes'),
          apiClient.get<Proyecto[]>('/proyectos'), // Para el dropdown
        ]);

        setReportes(Array.isArray(reportesRes.data) ? reportesRes.data : []);
        setProyectos(Array.isArray(proyectosRes.data) ? proyectosRes.data : []);

      } catch (error) {
        toast.error('No se pudieron cargar los datos');
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Cargar solo una vez

  // --- Lógica de Filtro ---
  // Si el usuario tiene un proyectoAsignadoId, filtra por él. Si no, muestra todos.
  const filteredReportes = reportes
    .filter(r => 
      proyectoAsignadoId ? r.proyectoId === proyectoAsignadoId : true
    )
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // --- Helpers ---
  const getProjectName = (proyectoId?: number) => {
    if (!proyectoId) return "Proyecto no asignado";
    return proyectos.find(p => p.id === proyectoId)?.nombre || `Proyecto ID: ${proyectoId}`;
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      // Poblar con el proyectoId del usuario por defecto (si lo tiene)
      proyectoId: proyectoAsignadoId?.toString() || '',
      resumen: '',
    });
    setEditingReporte(null); // Limpiar reporte en edición
  };

  // --- Manejadores de Diálogos ---
  const handleCreateOpenChange = (open: boolean) => {
    if (open) {
      resetForm(); // Poblar el formulario con valores por defecto al abrir
    }
    setIsCreateOpen(open);
  };
  
  const handleEditOpenChange = (open: boolean) => { // <--- NUEVO
    if (!open) {
      setEditingReporte(null); // Limpiar al cerrar
    }
    setIsEditOpen(open);
  };
  
  const openDeleteDialog = (id: string | number) => { // <--- NUEVO
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  // --- Lógica CRUD (API) ---

  const handleCreate = async () => {
    if (!formData.fecha || !formData.proyectoId || !formData.resumen) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    if (formData.resumen.length < 10) {
      toast.error('El resumen debe tener al menos 10 caracteres');
      return;
    }

    const newReportePayload = {
      fecha: formData.fecha,
      proyectoId: parseInt(formData.proyectoId),
      creadoPor: user?.nombre || 'Usuario', // Tomar el nombre del usuario en sesión
      resumen: formData.resumen,
    };

    try {
      const res = await apiClient.post<ReporteDiario>('/reportes', newReportePayload);
      setReportes([res.data, ...reportes]); // Añadir al inicio de la lista
      handleCreateOpenChange(false);
      toast.success('Reporte diario registrado exitosamente');
    } catch (error) {
      toast.error('Error al registrar el reporte');
      console.error(error);
    }
  };

  const handleEdit = (reporte: ReporteDiario) => { // <--- NUEVO
    setEditingReporte(reporte);
    setFormData({
      fecha: reporte.fecha ? reporte.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
      proyectoId: String(reporte.proyectoId),
      resumen: reporte.resumen,
    });
    handleEditOpenChange(true);
  };

  const handleUpdate = async () => { // <--- NUEVO
    if (!editingReporte) return;
    
    if (!formData.fecha || !formData.proyectoId || !formData.resumen) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    if (formData.resumen.length < 10) {
      toast.error('El resumen debe tener al menos 10 caracteres');
      return;
    }

    const updatedReportePayload = {
      // Usamos el 'creadoPor' original, no lo sobrescribimos
      creadoPor: editingReporte.creadoPor, 
      fecha: formData.fecha,
      proyectoId: parseInt(formData.proyectoId),
      resumen: formData.resumen,
    };

    try {
      const res = await apiClient.put<ReporteDiario>(`/reportes/${editingReporte.id}`, updatedReportePayload);
      setReportes(reportes.map(r => (r.id === editingReporte.id ? res.data : r)));
      handleEditOpenChange(false);
      toast.success('Reporte diario actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el reporte');
      console.error(error);
    }
  };
  
  const handleDelete = async () => { // <--- NUEVO
    if (!deletingId) return;

    try {
      await apiClient.delete(`/reportes/${deletingId}`);
      setReportes(reportes.filter(r => r.id !== deletingId));
      toast.success('Reporte eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el reporte');
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Reportes Diarios de Obra</h1>
            <p className="text-muted-foreground">Registre el avance y actividades del día</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Reporte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Reporte Diario</DialogTitle>
              </DialogHeader>
              <ReporteForm
                formData={formData}
                setFormData={setFormData}
                proyectos={proyectos}
                proyectoAsignadoId={proyectoAsignadoId}
                isEditMode={false}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Crear Reporte</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- Lista de Reportes --- */}
        {loading ? (
          <p>Cargando reportes...</p>
        ) : filteredReportes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay reportes registrados</h3>
              <p className="text-muted-foreground mb-4">Cree su primer reporte diario</p>
              <Button onClick={() => handleCreateOpenChange(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Reporte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {filteredReportes.map((reporte) => (
              <Card key={reporte.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">
                      {getProjectName(reporte.proyectoId)}
                    </CardTitle>
                    {/* <Badge variant="secondary">ID: {reporte.id}</Badge> */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(reporte)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => openDeleteDialog(reporte.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{reporte.fecha ? new Date(reporte.fecha).toLocaleDateString('es-ES') : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{reporte.creadoPor}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{reporte.resumen}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* --- Diálogos de Edición y Borrado --- */}
      
      {/* Modal de Edición */}
      <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Reporte Diario</DialogTitle>
          </DialogHeader>
          <ReporteForm
            formData={formData}
            setFormData={setFormData}
            proyectos={proyectos}
            proyectoAsignadoId={proyectoAsignadoId}
            isEditMode={true}
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
              el reporte diario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
};

export default GestionReportes;