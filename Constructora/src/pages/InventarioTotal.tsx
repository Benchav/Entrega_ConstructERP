import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventarioItem, Proyecto } from '@/data/models';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { Search, Package, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
// Nota: 'Building2' del Archivo 2 no se usó en la versión final de la UI (Archivo 1),
// así que lo omití para alinearme con el diseño del Archivo 1.

const InventarioTotal = () => {
  // --- Estados de API (del Archivo 2) ---
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de UI (del Archivo 1) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProyecto, setSelectedProyecto] = useState<string>('todos');

  // --- Carga de datos (del Archivo 2) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invRes, proyRes] = await Promise.all([
          apiClient.get<InventarioItem[]>('/inventario'),
          apiClient.get<Proyecto[]>('/proyectos'), // Necesario para el filtro
        ]);

        const safeInv = Array.isArray(invRes.data) ? invRes.data : [];
        const safeProy = Array.isArray(proyRes.data) ? proyRes.data : [];

        setInventario(safeInv);
        setProyectos(safeProy);

        if (safeInv.length === 0) {
          toast.info("No hay inventario registrado o no tienes permisos para verlo.");
        }

      } catch (error) {
        toast.error('No se pudo cargar el inventario total');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Lógica de Filtro (del Archivo 1, adaptada a estado de API) ---
  const filteredInventario = inventario
    .filter(i => {
      const itemNombre = i.item ?? ""; // Defensa contra null/undefined
      const proyectoId = i.proyectoId ?? 0; // Defensa contra null/undefined

      const matchesSearch = itemNombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProyecto = selectedProyecto === 'todos' || proyectoId.toString() === selectedProyecto;
      
      return matchesSearch && matchesProyecto;
    });

  // --- Lógica de KPIs (del Archivo 1, adaptada a estado de API) ---
  const totalItems = inventario.length;
  // Usamos (i.stock ?? 0) para defendernos de valores nulos
  const itemsCriticos = inventario.filter(i => (i.stock ?? 0) < 20).length;
  const valorTotal = inventario.reduce((sum, i) => sum + (i.stock ?? 0), 0);


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Inventario Total de la Empresa</h1>
          <p className="text-muted-foreground">Vista consolidada del inventario en todos los proyectos</p>
        </div>

        {/* KPIs (del Archivo 1, usando datos de API) */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Total de Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{totalItems}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Items Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{itemsCriticos}</p>
              <p className="text-xs text-muted-foreground mt-1">Stock menor a 20</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unidades Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{valorTotal.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Card de la Tabla (del Archivo 1) */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario Consolidado</CardTitle>
            {/* Filtros (del Archivo 1) */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Select (del Archivo 1, usando 'proyectos' de API) */}
              <Select value={selectedProyecto} onValueChange={setSelectedProyecto}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Todos los Proyectos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los Proyectos</SelectItem>
                  {proyectos.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Lógica de Carga (del Archivo 2) */}
            {loading ? (
              <p>Cargando inventario total...</p>
            ) : inventario.length === 0 ? (
              <p className="text-muted-foreground">No hay registros de inventario.</p>
            ) : (
              // Tabla (del Archivo 1, usando 'filteredInventario')
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventario.map((item) => {
                      const stock = item.stock ?? 0; // Defensa
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.item ?? "N/A"}</TableCell>
                          <TableCell>
                            {/* Lógica de encontrar proyecto (del Archivo 1, usando 'proyectos' de API) */}
                            {proyectos.find(p => p.id === item.proyectoId)?.nombre ?? "N/A"}
                          </TableCell>
                          <TableCell>{item.unidad ?? "N/A"}</TableCell>
                          <TableCell className="font-bold text-lg">{stock}</TableCell>
                          <TableCell>
                            {/* Lógica de Badge (combinando ambas versiones para robustez) */}
                            <Badge variant={stock < 20 ? 'destructive' : stock < 50 ? 'default' : 'secondary'}
                              className={stock < 20 ? undefined : stock < 50 ? 'bg-warning text-warning-foreground' : undefined}
                            >
                              {stock < 20 ? 'Crítico' : stock < 50 ? 'Bajo' : 'Normal'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InventarioTotal;