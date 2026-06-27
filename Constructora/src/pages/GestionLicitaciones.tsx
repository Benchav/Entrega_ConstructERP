// src/pages/GestionLicitaciones.tsx
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Licitacion } from '@/data/models'; // Importar modelo
import apiClient from '@/lib/api'; // Importar API Client
import { Plus, Pencil, Trash2, Search, Briefcase, Trophy, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Definición de tipo para el formulario
type LicitacionFormData = {
  nombre: string;
  estado: string;
  monto: string;
  fechaLimite: string;
};

// --- Mover estado inicial fuera ---
const initialFormData: LicitacionFormData = {
  nombre: '',
  estado: 'En Preparacion', // Estado por defecto
  monto: '',
  fechaLimite: '',
};

// ====================================================================
// 1. EXTRAER EL FORMULARIO A SU PROPIO COMPONENTE
// ====================================================================
interface LicitacionFormProps {
  formData: LicitacionFormData;
  setFormData: React.Dispatch<React.SetStateAction<LicitacionFormData>>;
}

const LicitacionForm = React.memo(({ formData, setFormData }: LicitacionFormProps) => {

  // 2. CREAR MANEJADORES DE CAMBIO ESTABLES
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, estado: value }));
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre del Proyecto</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={handleInputChange} // Usar manejador estable
          placeholder="Ej: Hospital Regional"
        />
      </div>
      <div>
        <Label htmlFor="estado">Estado</Label>
        <Select 
          value={formData.estado} 
          onValueChange={handleSelectChange} // Usar manejador estable
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="En Preparacion">En Preparación</SelectItem>
            <SelectItem value="Presentada">Presentada</SelectItem>
            <SelectItem value="Ganada">Ganada</SelectItem>
            <SelectItem value="Perdida">Perdida</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="monto">Monto de la Propuesta ($)</Label>
        <Input
          id="monto"
          type="number"
          value={formData.monto}
          onChange={handleInputChange} // Usar manejador estable
          placeholder="0.00"
        />
      </div>
      <div>
        <Label htmlFor="fechaLimite">Fecha Límite (Opcional)</Label>
        <Input
          id="fechaLimite"
          type="date"
          value={formData.fechaLimite}
          onChange={handleInputChange} // Usar manejador estable
        />
      </div>
    </div>
  );
});

// ====================================================================
// 3. COMPONENTE PRINCIPAL (Ahora más limpio)
// ====================================================================
const GestionLicitaciones = () => {
  // --- Estados de Datos (API) ---
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de UI (CRUD, Búsqueda) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLicitacion, setEditingLicitacion] = useState<Licitacion | null>(null);

  // --- Estados para Diálogos ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState<LicitacionFormData>(initialFormData);

  // --- Carga de Datos (API) ---
  useEffect(() => {
    const fetchLicitaciones = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<Licitacion[]>('/licitaciones');
        setLicitaciones(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        toast.error('No se pudieron cargar las licitaciones');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLicitaciones();
  }, []);

  // --- Lógica de UI (Filtros, KPIs) ---
  const filteredLicitaciones = licitaciones.filter(l =>
    (l.nombre?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );

  const ganadas = licitaciones.filter(l => l.estado === 'Ganada').length;
  const presentadas = licitaciones.filter(l => l.estado === 'Presentada').length;
  const enPreparacion = licitaciones.filter(l => l.estado === 'En Preparacion').length;

  // --- Helpers ---
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingLicitacion(null);
  };

  const handleCreateOpenChange = (open: boolean) => {
    if (open) resetForm();
    setIsCreateOpen(open);
  };

  const handleEditOpenChange = (open: boolean) => {
    if (!open) { setEditingLicitacion(null); resetForm(); }
    setIsEditOpen(open);
  };

  // --- Lógica CRUD (API) ---

  const handleCreate = async () => {
    if (!formData.nombre || !formData.estado || !formData.monto) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const newLicitacionPayload = {
      nombre: formData.nombre,
      estado: formData.estado as Licitacion["estado"],
      monto: parseFloat(formData.monto),
      fechaLimite: formData.fechaLimite || undefined, // Enviar undefined si está vacío
    };

    try {
      const res = await apiClient.post<Licitacion>('/licitaciones', newLicitacionPayload);
      setLicitaciones([...licitaciones, res.data]);
      handleCreateOpenChange(false);
      toast.success('Licitación registrada exitosamente');
    } catch (error) {
      toast.error('Error al registrar la licitación');
      console.error(error);
    }
  };

  const handleEdit = (licitacion: Licitacion) => {
    setEditingLicitacion(licitacion);
    setFormData({
      nombre: licitacion.nombre,
      estado: licitacion.estado,
      monto: String(licitacion.monto),
      fechaLimite: licitacion.fechaLimite ? licitacion.fechaLimite.split('T')[0] : '',
    });
    handleEditOpenChange(true);
  };

  const handleUpdate = async () => {
    if (!editingLicitacion || !formData.nombre || !formData.estado || !formData.monto) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const updatedLicitacionPayload = {
      nombre: formData.nombre,
      estado: formData.estado as Licitacion["estado"],
      monto: parseFloat(formData.monto),
      fechaLimite: formData.fechaLimite || undefined,
    };

    try {
      const res = await apiClient.put<Licitacion>(`/licitaciones/${editingLicitacion.id}`, updatedLicitacionPayload);
      setLicitaciones(licitaciones.map(l => (l.id === editingLicitacion.id ? res.data : l)));
      handleEditOpenChange(false);
      toast.success('Licitación actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar la licitación');
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
      await apiClient.delete(`/licitaciones/${deletingId}`);
      setLicitaciones(licitaciones.filter(l => l.id !== deletingId));
      toast.success('Licitación eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la licitación');
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Licitaciones</h1>
            <p className="text-muted-foreground">Seguimiento de licitaciones y propuestas comerciales</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Licitación
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nueva Licitación</DialogTitle>
              </DialogHeader>
              {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
              <LicitacionForm
                formData={formData}
                setFormData={setFormData}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Registrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPIs Licitaciones */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-success" />
                Ganadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">{ganadas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Presentadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{presentadas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                En Preparación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{enPreparacion}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Licitaciones</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar licitación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando licitaciones...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Monto Propuesta</TableHead>
                      <TableHead>Fecha Límite</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLicitaciones.map((licitacion) => (
                      <TableRow key={licitacion.id}>
                        <TableCell className="font-medium">{licitacion.nombre}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              licitacion.estado === 'Ganada' ? 'default' :
                              licitacion.estado === 'Presentada' ? 'secondary' :
                              licitacion.estado === 'Perdida' ? 'destructive' :
                              'outline'
                            }
                            className={
                              licitacion.estado === 'Ganada' ? 'bg-success hover:bg-success/80' :
                              licitacion.estado === 'Presentada' ? 'bg-primary text-primary-foreground hover:bg-primary/80' :
                              licitacion.estado === 'En Preparacion' ? 'bg-warning text-warning-foreground hover:bg-warning/80' :
                              ''
                            }
                          >
                            {licitacion.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">${(Number(licitacion.monto) || 0).toLocaleString()}</TableCell>
                        <TableCell>{licitacion.fechaLimite ? new Date(licitacion.fechaLimite).toLocaleDateString('es-ES') : '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(licitacion)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => openDeleteDialog(licitacion.id)}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Licitación</DialogTitle>
            </DialogHeader>
            {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
            <LicitacionForm
              formData={formData}
              setFormData={setFormData}
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
                el registro de la licitación.
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

export default GestionLicitaciones;