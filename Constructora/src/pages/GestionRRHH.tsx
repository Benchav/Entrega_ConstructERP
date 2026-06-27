// src/pages/GestionRRHH.tsx
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
import { Empleado, Proyecto } from '@/data/models'; // Importar ambos modelos
import apiClient from '@/lib/api'; // Importar API Client
import { Plus, Pencil, Trash2, Search, Users, DollarSign } from 'lucide-react'; // Añadido DollarSign
import { toast } from 'sonner';

// Definición de tipo para el formulario
type EmpleadoFormData = {
  nombre: string;
  puesto: string;
  proyectoAsignadoId: string;
  salario: string;
};

// --- Mover estado inicial fuera ---
const initialFormData: EmpleadoFormData = {
  nombre: '',
  puesto: '',
  proyectoAsignadoId: '',
  salario: '',
};

// ====================================================================
// 1. EXTRAER EL FORMULARIO A SU PROPIO COMPONENTE
// ====================================================================
interface EmpleadoFormProps {
  formData: EmpleadoFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmpleadoFormData>>;
  proyectos: Proyecto[];
}

const EmpleadoForm = React.memo(({ formData, setFormData, proyectos }: EmpleadoFormProps) => {

  // 2. CREAR MANEJADORES DE CAMBIO ESTABLES
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, proyectoAsignadoId: value }));
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre Completo</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={handleInputChange} // Usar manejador estable
          placeholder="Ej: Juan Pérez"
        />
      </div>
      <div>
        <Label htmlFor="puesto">Puesto</Label>
        <Input
          id="puesto"
          value={formData.puesto}
          onChange={handleInputChange} // Usar manejador estable
          placeholder="Ej: Albañil, Electricista, Operador"
        />
      </div>
      <div>
        <Label htmlFor="proyecto">Proyecto Asignado</Label>
        <Select 
          value={formData.proyectoAsignadoId} 
          onValueChange={handleSelectChange} // Usar manejador estable
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un proyecto" />
          </SelectTrigger>
          <SelectContent>
            {proyectos.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="salario">Salario Mensual ($)</Label>
        <Input
          id="salario"
          type="number"
          value={formData.salario}
          onChange={handleInputChange} // Usar manejador estable
          placeholder="0.00"
        />
      </div>
    </div>
  );
});

// ====================================================================
// 3. COMPONENTE PRINCIPAL (Ahora más limpio)
// ====================================================================
const GestionRRHH = () => {
  // --- Estados de Datos (API) ---
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de UI (CRUD, Búsqueda) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  
  // --- Estados para Diálogos ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<EmpleadoFormData>(initialFormData);

  // --- Carga de Datos (API) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empleadosRes, proyectosRes] = await Promise.all([
          apiClient.get<Empleado[]>('/empleados'),
          apiClient.get<Proyecto[]>('/proyectos'), // Para el dropdown
        ]);
        
        setEmpleados(Array.isArray(empleadosRes.data) ? empleadosRes.data : []);
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

  // --- Helper (para la tabla) ---
  const getProjectName = (proyectoId: number | null) => {
    if (!proyectoId) return "Sin asignar";
    if (!proyectos || proyectos.length === 0) return `ID: ${proyectoId}`;
    return proyectos.find(p => p.id === proyectoId)?.nombre || `ID: ${proyectoId}`;
  }

  // --- Lógica de UI (Filtros, KPIs) ---
  const filteredEmpleados = empleados.filter(e =>
    (e.nombre?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (e.puesto?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );

  const totalNomina = empleados.reduce((sum, e) => sum + (Number(e.salario) || 0), 0);

  // --- Helpers de Formulario ---
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingEmpleado(null);
  };

  const handleCreateOpenChange = (open: boolean) => {
    if (open) resetForm();
    setIsCreateOpen(open);
  };

  const handleEditOpenChange = (open: boolean) => {
    if (!open) resetForm();
    setIsEditOpen(open);
  };

  // --- Lógica CRUD (API) ---

  const handleCreate = async () => {
    if (!formData.nombre || !formData.puesto || !formData.proyectoAsignadoId || !formData.salario) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    const newEmpleadoPayload = {
      nombre: formData.nombre,
      puesto: formData.puesto,
      proyectoAsignadoId: parseInt(formData.proyectoAsignadoId),
      salario: parseFloat(formData.salario),
    };

    try {
      const res = await apiClient.post<Empleado>('/empleados', newEmpleadoPayload);
      setEmpleados([...empleados, res.data]);
      handleCreateOpenChange(false);
      toast.success('Empleado agregado exitosamente');
    } catch (error) {
      toast.error('Error al agregar al empleado');
      console.error(error);
    }
  };

  const handleEdit = (empleado: Empleado) => {
    setEditingEmpleado(empleado);
    setFormData({
      nombre: empleado.nombre,
      puesto: empleado.puesto,
      proyectoAsignadoId: String(empleado.proyectoAsignadoId),
      salario: String(empleado.salario),
    });
    handleEditOpenChange(true);
  };

  const handleUpdate = async () => {
    if (!editingEmpleado || !formData.nombre || !formData.puesto || !formData.proyectoAsignadoId || !formData.salario) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    const updatedEmpleadoPayload = {
      nombre: formData.nombre,
      puesto: formData.puesto,
      proyectoAsignadoId: parseInt(formData.proyectoAsignadoId),
      salario: parseFloat(formData.salario),
    };

    try {
      const res = await apiClient.put<Empleado>(`/empleados/${editingEmpleado.id}`, updatedEmpleadoPayload);
      setEmpleados(empleados.map(e => (e.id === editingEmpleado.id ? res.data : e)));
      handleEditOpenChange(false);
      toast.success('Empleado actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar al empleado');
      console.error(error);
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    
    try {
      await apiClient.delete(`/empleados/${deletingId}`);
      setEmpleados(empleados.filter(e => e.id !== deletingId));
      toast.success('Empleado eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar al empleado');
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Recursos Humanos</h1>
            <p className="text-muted-foreground">Administre el personal de la empresa</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
              </DialogHeader>
              {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
              <EmpleadoForm
                formData={formData}
                setFormData={setFormData}
                proyectos={proyectos}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Agregar Empleado</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPIs RRHH */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Total Empleados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{empleados.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" /> {/* Icono añadido */}
                Nómina Total Mensual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">${totalNomina.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Empleados</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o puesto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando empleados...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Puesto</TableHead>
                      <TableHead>Proyecto Asignado</TableHead>
                      <TableHead className="text-right">Salario</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmpleados.map((empleado) => (
                      <TableRow key={empleado.id}>
                        <TableCell className="font-medium">{empleado.nombre}</TableCell>
                        <TableCell>{empleado.puesto}</TableCell>
                        <TableCell>
                          {getProjectName(empleado.proyectoAsignadoId)}
                        </TableCell>
                        <TableCell className="text-right font-bold">${(Number(empleado.salario) || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(empleado)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => openDeleteDialog(empleado.id)}
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
              <DialogTitle>Editar Empleado</DialogTitle>
            </DialogHeader>
            {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
            <EmpleadoForm
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
                al empleado.
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

export default GestionRRHH;