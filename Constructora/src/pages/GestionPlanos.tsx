// src/pages/GestionPlanos.tsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription, // Importar para el diálogo de borrado
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plano, Proyecto } from '@/data/models'; // Importar ambos modelos
import apiClient from '@/lib/api'; // Importar API Client
import { Plus, Pencil, Trash2, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Definición de tipo para el formulario
type PlanoFormData = {
  nombre: string;
  proyectoId: string;
  categoria: string;
  fecha: string;
};

const GestionPlanos = () => {
  // --- Estados de Datos (API) ---
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de UI (CRUD, Búsqueda) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // Para el modal de confirmación

  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const initialFormData: PlanoFormData = {
    nombre: '',
    proyectoId: '',
    categoria: '',
    fecha: new Date().toISOString().split('T')[0],
  };
  const [formData, setFormData] = useState<PlanoFormData>(initialFormData);

  // Lista de categorías (de Archivo 1)
  const categorias = ['Estructural', 'Arquitectónico', 'Electricidad', 'Hidráulico', 'Mecánico', 'Sanitario'];

  // --- Carga de Datos (API) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [planosRes, proyectosRes] = await Promise.all([
          apiClient.get<Plano[]>('/planos'),
          apiClient.get<Proyecto[]>('/proyectos'), // Necesario para el dropdown
        ]);
        
        setPlanos(Array.isArray(planosRes.data) ? planosRes.data : []);
        setProyectos(Array.isArray(proyectosRes.data) ? proyectosRes.data : []);

      } catch (error) {
        toast.error('No se pudieron cargar los datos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Lógica de Búsqueda ---
  const filteredPlanos = planos.filter(p =>
    (p.nombre?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (p.categoria?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingPlano(null);
  };

  // --- Lógica CRUD (API) ---

  const handleCreate = async () => {
    if (!formData.nombre || !formData.proyectoId || !formData.categoria) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const newPlanoPayload = {
      nombre: formData.nombre,
      proyectoId: parseInt(formData.proyectoId), // Convertir a número
      categoria: formData.categoria,
      fecha: formData.fecha,
    };

    try {
      const res = await apiClient.post<Plano>('/planos', newPlanoPayload);
      setPlanos([...planos, res.data]); // Añadir el nuevo plano devuelto por la API
      setIsCreateOpen(false);
      resetForm();
      toast.success('Plano registrado exitosamente');
    } catch (error) {
      toast.error('Error al registrar el plano');
      console.error(error);
    }
  };

  const handleEdit = (plano: Plano) => {
    setEditingPlano(plano);
    setFormData({
      nombre: plano.nombre,
      proyectoId: String(plano.proyectoId), // Convertir a string para el Select
      categoria: plano.categoria,
      fecha: plano.fecha ? plano.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingPlano) return;

    if (!formData.nombre || !formData.proyectoId || !formData.categoria) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const updatedPlanoPayload = {
      nombre: formData.nombre,
      proyectoId: parseInt(formData.proyectoId),
      categoria: formData.categoria,
      fecha: formData.fecha,
    };

    try {
      const res = await apiClient.put<Plano>(`/planos/${editingPlano.id}`, updatedPlanoPayload);
      setPlanos(planos.map(p => (p.id === editingPlano.id ? res.data : p)));
      setIsEditOpen(false);
      resetForm();
      toast.success('Plano actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el plano');
      console.error(error);
    }
  };

  // Abre el modal de confirmación
  const openDeleteDialog = (id: string | number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  // Ejecuta la eliminación
  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await apiClient.delete(`/planos/${deletingId}`);
      setPlanos(planos.filter(p => p.id !== deletingId));
      setIsDeleteOpen(false);
      setDeletingId(null);
      toast.success('Plano eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el plano');
      setIsDeleteOpen(false);
      setDeletingId(null);
      console.error(error);
    }
  };

  // Componente de Formulario reutilizable
  const PlanoForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre del Archivo</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Ej: Plano Estructural P1.pdf"
        />
      </div>
      <div>
        <Label htmlFor="proyecto">Proyecto</Label>
        <Select value={formData.proyectoId} onValueChange={(value) => setFormData({ ...formData, proyectoId: value })}>
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
        <Label htmlFor="categoria">Categoría</Label>
        <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione categoría" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="fecha">Fecha</Label>
        <Input
          id="fecha"
          type="date"
          value={formData.fecha}
          onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Planos</h1>
            <p className="text-muted-foreground">Administre la documentación técnica de proyectos</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Plano
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Plano</DialogTitle>
              </DialogHeader>
              <PlanoForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>Cancelar</Button>
                <Button onClick={handleCreate}>Registrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Biblioteca de Planos</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Cargando planos...</p>
            ) : filteredPlanos.length === 0 ? (
                <p className="text-muted-foreground">No se encontraron planos.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlanos.map((plano) => (
                  <Card key={plano.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate" title={plano.nombre}>{plano.nombre}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {/* Usar 'proyectos' de la API */}
                            {proyectos.find(p => p.id === plano.proyectoId)?.nombre ?? "N/A"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{plano.categoria}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {plano.fecha ? new Date(plano.fecha).toLocaleDateString('es-ES') : "N/A"}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(plano)}
                              className="flex-1"
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(plano.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* --- Diálogos --- */}

        {/* Diálogo de Editar */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Plano</DialogTitle>
            </DialogHeader>
            <PlanoForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleUpdate}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Confirmar Borrado */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Está seguro?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente
                el registro del plano.
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

export default GestionPlanos;