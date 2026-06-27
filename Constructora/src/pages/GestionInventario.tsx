// src/pages/GestionInventario.tsx
import { useState, useEffect, useMemo } from 'react';
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
  DialogDescription, // Importar para modal de borrado
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Importar Select
import { InventarioItem, Proyecto } from '@/data/models';
import apiClient from '@/lib/api'; // Importar apiClient
import { useAuth } from '@/hooks/useAuth'; // Estandarizado a @/hooks/useAuth
import { Plus, Pencil, Trash2, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Definición de tipo para el formulario
type InventarioFormData = {
  item: string;
  unidad: string;
  stock: string;
};

const GestionInventario = () => {
  const { user } = useAuth();

  // --- Estados de Datos (API) ---
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]); // Para el selector
  const [loading, setLoading] = useState(true);

  // --- Estados de UI (CRUD, Búsqueda, Filtro) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventarioItem | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [selectedProyecto, setSelectedProyecto] = useState<number | null>(null);

  const initialFormData: InventarioFormData = {
    item: '',
    unidad: '',
    stock: '',
  };
  const [formData, setFormData] = useState<InventarioFormData>(initialFormData);

  // Determinar permisos y proyecto inicial (Lógica de Archivo 2)
  const puedeVerTodos = useMemo(() => ['CEO', 'Administrador'].includes(user?.rol || ''), [user]);

  useEffect(() => {
    // Establecer el proyecto seleccionado una vez que el usuario cargue
    if (user) {
      setSelectedProyecto(user.proyectoAsignadoId ?? null);
    }
  }, [user]);

  // --- Carga de Datos (API) ---
  useEffect(() => {
    // No cargar nada si el usuario no ha cargado
    if (!user) return; 
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invRes, proyRes] = await Promise.all([
          apiClient.get<InventarioItem[]>('/inventario'),
          apiClient.get<Proyecto[]>('/proyectos'), // Para el selector
        ]);

        setInventario(Array.isArray(invRes.data) ? invRes.data : []);
        setProyectos(Array.isArray(proyRes.data) ? proyRes.data : []);
        
      } catch (error) {
        toast.error('No se pudieron cargar los datos');
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]); // Recargar si el usuario cambia

  // --- Lógica de Filtro (Combinada) ---
  const inventarioFiltrado = useMemo(() => {
    if (loading || !inventario) return [];

    return inventario
      // 1. Filtrar por Proyecto (Lógica de Archivo 2)
      .filter(item => {
        // Si no hay proyecto seleccionado (raro) o no tiene ID, no mostrar
        if (selectedProyecto === null) return false; 
        return item.proyectoId === selectedProyecto;
      })
      // 2. Filtrar por Búsqueda (Lógica de Archivo 1)
      .filter(item =>
        (item.item?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
      );
  }, [inventario, selectedProyecto, searchTerm, loading]);

  
  // --- Helpers ---
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingItem(null);
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
    if (!formData.item || !formData.unidad || !formData.stock) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    // Asegurarse de que haya un proyecto seleccionado para asignar el item
    if (selectedProyecto === null) {
      toast.error('No hay un proyecto seleccionado para asignar el item.');
      return;
    }

    const newItemPayload = {
      item: formData.item,
      unidad: formData.unidad,
      stock: parseInt(formData.stock),
      proyectoId: selectedProyecto, // Asignar al proyecto seleccionado
    };

    try {
      const res = await apiClient.post<InventarioItem>('/inventario', newItemPayload);
      setInventario([...inventario, res.data]); // Añadir el nuevo item
      handleCreateOpenChange(false);
      toast.success('Item agregado exitosamente');
    } catch (error) {
      toast.error('Error al agregar el item');
      console.error(error);
    }
  };

  const handleEdit = (item: InventarioItem) => {
    setEditingItem(item);
    setFormData({
      item: item.item,
      unidad: item.unidad,
      stock: String(item.stock),
    });
    handleEditOpenChange(true);
  };

  const handleUpdate = async () => {
    if (!editingItem || !formData.item || !formData.unidad) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    const updatedItemPayload = {
      ...editingItem, // Preservar IDs y proyectoId
      item: formData.item,
      unidad: formData.unidad,
      stock: parseInt(formData.stock),
    };

    try {
      const res = await apiClient.put<InventarioItem>(`/inventario/${editingItem.id}`, updatedItemPayload);
      setInventario(inventario.map(i => (i.id === editingItem.id ? res.data : i)));
      handleEditOpenChange(false);
      toast.success('Item actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el item');
      console.error(error);
    }
  };
  
  // Manejar Entrada/Salida de Stock (de Archivo 1)
  const handleStockChange = async (id: number, change: number) => {
    const item = inventario.find(i => i.id === id);
    if (!item) return;

    const newStock = Math.max(0, (item.stock ?? 0) + change);
    
    // Optimistic UI update
    const oldInventario = [...inventario];
    setInventario(inventario.map(i =>
      i.id === id ? { ...i, stock: newStock } : i
    ));

    try {
      // Enviar el item completo actualizado al backend
      await apiClient.put(`/inventario/${item.id}`, { ...item, stock: newStock });
      toast.success(change > 0 ? 'Entrada registrada' : 'Salida registrada');
    } catch (error) {
      // Revertir en caso de error
      setInventario(oldInventario);
      toast.error('Error al actualizar el stock');
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
      await apiClient.delete(`/inventario/${deletingId}`);
      setInventario(inventario.filter(i => i.id !== deletingId));
      toast.success('Item eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el item');
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Inventario</h1>
            <p className="text-muted-foreground">Administre el inventario de la obra</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="item">Nombre del Item</Label>
                  <Input
                    id="item"
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    placeholder="Ej: Cemento Portland"
                  />
                </div>
                <div>
                  <Label htmlFor="unidad">Unidad de Medida</Label>
                  <Input
                    id="unidad"
                    value={formData.unidad}
                    onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                    placeholder="Ej: sacos, toneladas, m³"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Inicial</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Agregar Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Card de la Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario de la Obra</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {/* Búsqueda (de Archivo 1) */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Selector de Proyecto (de Archivo 2) */}
              {puedeVerTodos && (
                <Select
                  value={selectedProyecto?.toString() ?? ''}
                  onValueChange={(value) => setSelectedProyecto(value ? Number(value) : null)}
                >
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {proyectos.map((proyecto) => (
                      <SelectItem key={proyecto.id} value={String(proyecto.id)}>
                        {proyecto.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando inventario...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventarioFiltrado.length > 0 ? (
                      inventarioFiltrado.map((item) => {
                        const stock = item.stock ?? 0;
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.item}</TableCell>
                            <TableCell>{item.unidad}</TableCell>
                            <TableCell className="font-bold text-lg">{stock}</TableCell>
                            <TableCell>
                              <Badge variant={stock < 20 ? 'destructive' : stock < 50 ? 'default' : 'secondary'}
                                className={stock < 50 && stock >= 20 ? 'bg-warning text-warning-foreground' : ''}
                              >
                                {stock < 20 ? 'Crítico' : stock < 50 ? 'Bajo' : 'Normal'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleStockChange(item.id, 10)} // Asumiendo +10
                                  title="Entrada"
                                >
                                  <ArrowUp className="h-4 w-4 text-success" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleStockChange(item.id, -10)} // Asumiendo -10
                                  title="Salida"
                                >
                                  <ArrowDown className="h-4 w-4 text-destructive" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => openDeleteDialog(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No hay elementos en inventario para este proyecto.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Edición (de Archivo 1) */}
        <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-item">Nombre del Item</Label>
                <Input
                  id="edit-item"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-unidad">Unidad de Medida</Label>
                <Input
                  id="edit-unidad"
                  value={formData.unidad}
                  onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleEditOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleUpdate}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Modal de Confirmar Borrado (Nuevo) */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Está seguro?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente
                el item del inventario.
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

export default GestionInventario;