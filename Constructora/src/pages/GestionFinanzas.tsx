// src/pages/GestionFinanzas.tsx
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Finanza, Proyecto } from '@/data/models'; // Asumiendo que Proyecto también está en models
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define un tipo para el formulario para asegurar consistencia
type FinanzaFormData = {
  tipo: "Ingreso" | "Costo" | "";
  proyectoId: string; // El ID del proyecto como string (del formulario)
  descripcion: string;
  monto: string; // El monto como string (del formulario)
  categoria: string;
  fecha: string; // Formato YYYY-MM-DD
};

// --- Mover estado inicial fuera ---
const initialFormData: FinanzaFormData = {
  tipo: '',
  proyectoId: '',
  descripcion: '',
  monto: '',
  categoria: '',
  fecha: new Date().toISOString().split('T')[0],
};

// ====================================================================
// 1. EXTRAER EL FORMULARIO A SU PROPIO COMPONENTE
// ====================================================================
interface FinanzaFormProps {
  formData: FinanzaFormData;
  setFormData: React.Dispatch<React.SetStateAction<FinanzaFormData>>;
  proyectos: Proyecto[];
}

const FinanzaForm = React.memo(({ formData, setFormData, proyectos }: FinanzaFormProps) => {

  // 2. CREAR MANEJADORES DE CAMBIO ESTABLES
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof FinanzaFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tipo">Tipo de Movimiento</Label>
        <Select 
          value={formData.tipo} 
          onValueChange={handleSelectChange('tipo')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ingreso">Ingreso</SelectItem>
            <SelectItem value="Costo">Costo</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
            {proyectos.length > 0 ? (
              proyectos.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>Cargando proyectos...</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Input
          id="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          placeholder="Ej: Pago de planilla quincenal"
        />
      </div>
      <div>
        <Label htmlFor="monto">Monto ($)</Label>
        <Input
          id="monto"
          type="number"
          value={formData.monto}
          onChange={handleInputChange}
          placeholder="0.00"
        />
      </div>
      <div>
        <Label htmlFor="categoria">Categoría (Opcional)</Label>
        <Input
          id="categoria"
          value={formData.categoria}
          onChange={handleInputChange}
          placeholder="Ej: Materiales, Mano de Obra, Equipo"
        />
      </div>
      <div>
        <Label htmlFor="fecha">Fecha</Label>
        <Input
          id="fecha"
          type="date"
          value={formData.fecha}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
});

// ====================================================================
// 3. COMPONENTE PRINCIPAL (Ahora más limpio)
// ====================================================================
const GestionFinanzas = () => {
  const [finanzas, setFinanzas] = useState<Finanza[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]); // Estado para los proyectos
  const [loading, setLoading] = useState(true);
  
  // Estados para UI (CRUD y Búsqueda)
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingFinanza, setEditingFinanza] = useState<Finanza | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState<FinanzaFormData>(initialFormData);

  // Cargar Finanzas y Proyectos (para el <Select>)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar ambos en paralelo
        const [resFinanzas, resProyectos] = await Promise.all([
          apiClient.get<Finanza[]>('/finanzas'),
          apiClient.get<Proyecto[]>('/proyectos') // Necesario para el dropdown
        ]);
        
        setFinanzas(Array.isArray(resFinanzas.data) ? resFinanzas.data : []);
        setProyectos(Array.isArray(resProyectos.data) ? resProyectos.data : []);

      } catch (error) {
        toast.error('No se pudieron cargar los datos iniciales');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lógica de Búsqueda (del Archivo 1)
  const filteredFinanzas = finanzas.filter(f =>
    f.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.categoria && f.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Lógica de KPIs (Común en ambos)
  const totalIngresos = finanzas.filter(f => f.tipo === 'Ingreso').reduce((sum, f) => sum + (Number(f.monto) || 0), 0);
  const totalCostos = finanzas.filter(f => f.tipo === 'Costo').reduce((sum, f) => sum + (Number(f.monto) || 0), 0);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingFinanza(null);
  };

  // --- Lógica CRUD adaptada a API ---

  const handleCreate = async () => {
    if (!formData.tipo || !formData.proyectoId || !formData.descripcion || !formData.monto) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const newFinanzaPayload = {
      tipo: formData.tipo as "Ingreso" | "Costo",
      proyectoId: parseInt(formData.proyectoId),
      descripcion: formData.descripcion,
      monto: parseFloat(formData.monto),
      categoria: formData.categoria || undefined,
      fecha: formData.fecha,
    };

    try {
      const res = await apiClient.post<Finanza>('/finanzas', newFinanzaPayload);
      // Asumimos que la API devuelve el objeto creado con su ID
      setFinanzas([...finanzas, res.data]); 
      setIsCreateOpen(false);
      resetForm();
      toast.success('Movimiento financiero registrado exitosamente');
    } catch (error) {
      toast.error('Error al registrar el movimiento');
      console.error(error);
    }
  };

  const handleEdit = (finanza: Finanza) => {
    setEditingFinanza(finanza);
    setFormData({
      tipo: finanza.tipo,
      proyectoId: String(finanza.proyectoId), // Convertir a string para el Select
      descripcion: finanza.descripcion,
      monto: String(finanza.monto), // Convertir a string para el Input
      categoria: finanza.categoria || '',
      fecha: finanza.fecha ? finanza.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingFinanza) return;

    if (!formData.tipo || !formData.proyectoId || !formData.descripcion || !formData.monto) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const updatedFinanzaPayload = {
      tipo: formData.tipo as "Ingreso" | "Costo",
      proyectoId: parseInt(formData.proyectoId),
      descripcion: formData.descripcion,
      monto: parseFloat(formData.monto),
      categoria: formData.categoria || undefined,
      fecha: formData.fecha,
    };

    try {
      // Asumimos que la API devuelve el objeto actualizado
      const res = await apiClient.put<Finanza>(`/finanzas/${editingFinanza.id}`, updatedFinanzaPayload);
      
      setFinanzas(finanzas.map(f => (f.id === editingFinanza.id ? res.data : f)));
      setIsEditOpen(false);
      resetForm();
      toast.success('Movimiento actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el movimiento');
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
      await apiClient.delete(`/finanzas/${deletingId}`);
      
      setFinanzas(finanzas.filter(f => f.id !== deletingId));
      setIsDeleteOpen(false);
      setDeletingId(null);
      toast.success('Movimiento eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el movimiento');
      console.error(error);
      setIsDeleteOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión Financiera</h1>
            <p className="text-muted-foreground">Control de ingresos y costos por proyecto</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Movimiento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Movimiento Financiero</DialogTitle>
              </DialogHeader>
              {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
              <FinanzaForm
                formData={formData}
                setFormData={setFormData}
                proyectos={proyectos}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Registrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPIs Financieros */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Total Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">${totalIngresos.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Total Costos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">${totalCostos.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${totalIngresos - totalCostos >= 0 ? 'text-success' : 'text-destructive'}`}>
                ${(totalIngresos - totalCostos).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Movimientos Financieros</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando movimientos...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFinanzas.map((finanza) => (
                      <TableRow key={finanza.id}>
                        <TableCell>{finanza.fecha ? new Date(finanza.fecha).toLocaleDateString('es-ES') : '-'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={finanza.tipo === 'Ingreso' ? 'default' : 'secondary'}
                            className={finanza.tipo === 'Ingreso' ? 'bg-success hover:bg-success/80' : 'bg-destructive hover:bg-destructive/80'}
                          >
                            {finanza.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{proyectos.find(p => p.id === finanza.proyectoId)?.nombre ?? finanza.proyectoId}</TableCell>
                        <TableCell className="font-medium">{finanza.descripcion}</TableCell>
                        <TableCell>{finanza.categoria || '-'}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${finanza.tipo === 'Ingreso' ? 'text-success' : 'text-destructive'}`}>
                            ${(Number(finanza.monto) || 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(finanza)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => openDeleteDialog(finanza.id)}
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

        {/* --- Diálogos --- */}

        {/* Diálogo de Editar */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Movimiento</DialogTitle>
            </DialogHeader>
            {/* 4. USAR EL COMPONENTE EXTRAÍDO */}
            <FinanzaForm
              formData={formData}
              setFormData={setFormData}
              proyectos={proyectos}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
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
                el movimiento financiero.
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

export default GestionFinanzas;