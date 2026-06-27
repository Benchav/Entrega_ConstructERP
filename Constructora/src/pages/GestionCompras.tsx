// src/pages/GestionCompras.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { OrdenCompra, Proyecto } from '@/data/models'; // Importar ambos modelos
import apiClient from '@/lib/api'; // Importar API Client
import { Plus, Pencil, Trash2, Search, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Definición de tipo para el formulario
type OCFormData = {
  proyectoId: string;
  fechaPedido: string;
  proveedor: string;
  items: string;
  montoTotal: string;
  estado: string;
};

// --- Mover estado inicial fuera ---
const initialFormData: OCFormData = {
  proyectoId: '',
  fechaPedido: new Date().toISOString().split('T')[0],
  proveedor: '',
  items: '',
  montoTotal: '',
  estado: 'Pendiente',
};

// ====================================================================
// 1. EXTRAER EL FORMULARIO A SU PROPIO COMPONENTE
// ====================================================================

interface OCFormProps {
  formData: OCFormData;
  setFormData: React.Dispatch<React.SetStateAction<OCFormData>>;
  proyectos: Proyecto[];
}

const OCForm = React.memo(({ formData, setFormData, proyectos }: OCFormProps) => {
  
  // 2. CREAR MANEJADORES DE CAMBIO ESTABLES
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof OCFormData) => (value: string) => {
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
        <Label htmlFor="proveedor">Proveedor</Label>
        <Input
          id="proveedor"
          value={formData.proveedor}
          onChange={handleInputChange}
          placeholder="Ej: Ferretería Central"
        />
      </div>
      <div>
        <Label htmlFor="items">Resumen de Items Solicitados</Label>
        <Textarea
          id="items"
          value={formData.items}
          onChange={handleInputChange}
          placeholder="Ej: 50 sacos de Cemento, 10 toneladas de Arena"
          rows={4}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="montoTotal">Monto Total ($)</Label>
          <Input
            id="montoTotal"
            type="number"
            value={formData.montoTotal}
            onChange={handleInputChange}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="estado">Estado</Label>
          <Select 
            value={formData.estado} 
            onValueChange={handleSelectChange('estado')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="Emitida">Emitida</SelectItem>
              <SelectItem value="Recibida">Recibida</SelectItem>
              <SelectItem value="Cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
       <div>
          <Label htmlFor="fechaPedido">Fecha de Pedido</Label>
          <Input
            id="fechaPedido"
            type="date"
            value={formData.fechaPedido}
            onChange={handleInputChange}
          />
        </div>
    </div>
  );
});

// ====================================================================
// 3. COMPONENTE PRINCIPAL (Ahora más limpio)
// ====================================================================
const GestionCompras = () => {
  // --- Estados de Datos (API) ---
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de UI (CRUD, Búsqueda) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingOC, setEditingOC] = useState<OrdenCompra | null>(null);

  // --- Estados para Diálogos ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState<OCFormData>(initialFormData);

  // --- Carga de Datos (API) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordenesRes, proyectosRes] = await Promise.all([
          apiClient.get<OrdenCompra[]>('/ordenescompra'),
          apiClient.get<Proyecto[]>('/proyectos'),
        ]);

        setOrdenesCompra(Array.isArray(ordenesRes.data) ? ordenesRes.data : []);
        setProyectos(Array.isArray(proyectosRes.data) ? proyectosRes.data : []);

        if (!Array.isArray(ordenesRes.data) || ordenesRes.data.length === 0) {
          toast.info("No hay órdenes de compra disponibles.");
        }

      } catch (error) {
        toast.error('No se pudieron cargar los datos');
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // --- Lógica de UI (Filtros, KPIs) ---
  const filteredOC = ordenesCompra.filter(oc =>
    (oc.proveedor?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (oc.items?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );

  const ocPendientes = ordenesCompra.filter(oc => oc.estado === 'Pendiente' || oc.estado === 'Emitida').length;
  const montoTotalEmitido = ordenesCompra
    .filter(oc => oc.estado !== 'Cancelada')
    .reduce((sum, oc) => sum + (Number(oc.montoTotal) || 0), 0);

  // --- Helpers ---
  const getProjectName = (proyectoId: number | null) => {
    if (!proyectoId) return "N/A";
    return proyectos.find(p => p.id === proyectoId)?.nombre || 'N/A';
  }

  const renderStatusBadge = (estado: OrdenCompra['estado']) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
    let className = '';

    switch (estado) {
      case 'Emitida':
        variant = 'secondary';
        className = 'bg-primary text-primary-foreground';
        break;
      case 'Recibida':
        variant = 'default';
        className = 'bg-success text-success-foreground hover:bg-success/80';
        break;
      case 'Cancelada':
        variant = 'destructive';
        break;
      case 'Pendiente':
        variant = 'default';
        className = 'bg-warning text-warning-foreground hover:bg-warning/80';
        break;
    }
    return <Badge variant={variant} className={className}>{estado}</Badge>;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingOC(null);
  };
  
  const handleCreateOpenChange = (open: boolean) => {
    if (open) resetForm();
    setIsCreateOpen(open);
  };

  const handleEditOpenChange = (open: boolean) => {
    if (!open) { setEditingOC(null); resetForm(); }
    setIsEditOpen(open);
  };

  // --- Lógica CRUD (API) ---

  const handleCreate = async () => {
    if (!formData.proyectoId || !formData.proveedor || !formData.montoTotal || !formData.items) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const newOCPayload = {
      proyectoId: parseInt(formData.proyectoId),
      fechaPedido: formData.fechaPedido,
      proveedor: formData.proveedor,
      items: formData.items,
      montoTotal: parseFloat(formData.montoTotal),
      estado: formData.estado as OrdenCompra["estado"],
    };

    try {
      const res = await apiClient.post<OrdenCompra>('/ordenescompra', newOCPayload);
      setOrdenesCompra([...ordenesCompra, res.data]);
      handleCreateOpenChange(false);
      toast.success('Orden de Compra registrada exitosamente');
    } catch (error) {
      toast.error('Error al registrar la OC');
      console.error(error);
    }
  };

  const handleEdit = (oc: OrdenCompra) => {
    setEditingOC(oc);
    setFormData({
      proyectoId: String(oc.proyectoId),
      fechaPedido: oc.fechaPedido ? oc.fechaPedido.split('T')[0] : new Date().toISOString().split('T')[0],
      proveedor: oc.proveedor,
      items: oc.items,
      montoTotal: String(oc.montoTotal),
      estado: oc.estado,
    });
    handleEditOpenChange(true);
  };

  const handleUpdate = async () => {
    if (!editingOC) return;

    if (!formData.proyectoId || !formData.proveedor || !formData.montoTotal || !formData.items) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const updatedOCPayload = {
      proyectoId: parseInt(formData.proyectoId),
      fechaPedido: formData.fechaPedido,
      proveedor: formData.proveedor,
      items: formData.items,
      montoTotal: parseFloat(formData.montoTotal),
      estado: formData.estado as OrdenCompra["estado"],
    };

    try {
      const res = await apiClient.put<OrdenCompra>(`/ordenescompra/${editingOC.id}`, updatedOCPayload);
      setOrdenesCompra(ordenesCompra.map(oc => (oc.id === editingOC.id ? res.data : oc)));
      handleEditOpenChange(false);
      toast.success('Orden de Compra actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar la OC');
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
      await apiClient.delete(`/ordenescompra/${deletingId}`);
      setOrdenesCompra(ordenesCompra.filter(oc => oc.id !== deletingId));
      toast.success('Orden de Compra eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la OC');
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Órdenes de Compra</h1>
            <p className="text-muted-foreground">Administre el flujo de adquisición de materiales</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva OC
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Orden de Compra</DialogTitle>
              </DialogHeader>
              {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
              <OCForm
                formData={formData}
                setFormData={setFormData}
                proyectos={proyectos}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Registrar OC</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                OC Pendientes/Emitidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{ocPendientes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monto Total Adquisiciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">${montoTotalEmitido.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Órdenes de Compra</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por proveedor o items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando órdenes de compra...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Resumen de Items</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOC.map((oc) => (
                      <TableRow key={oc.id}>
                        <TableCell className="font-medium">{oc.id}</TableCell>
                        <TableCell>{getProjectName(oc.proyectoId)}</TableCell>
                        <TableCell>{oc.proveedor}</TableCell>
                        <TableCell className="max-w-xs truncate" title={oc.items}>{oc.items}</TableCell>
                        <TableCell>{oc.fechaPedido ? new Date(oc.fechaPedido).toLocaleDateString('es-ES') : "N/A"}</TableCell>
                        <TableCell className="text-right font-bold">${(Number(oc.montoTotal) || 0).toLocaleString()}</TableCell>
                        <TableCell>{renderStatusBadge(oc.estado)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(oc)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => openDeleteDialog(oc.id)}
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
              <DialogTitle>Editar Orden de Compra</DialogTitle>
            </DialogHeader>
            {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
            <OCForm
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
                la orden de compra.
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

export default GestionCompras;