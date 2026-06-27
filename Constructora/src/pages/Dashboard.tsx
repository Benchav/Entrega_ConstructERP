// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react';
import { Proyecto, Empleado, SolicitudDinero, SolicitudMaterial, Finanza } from '@/data/models';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';

// Colores para el gráfico de torta
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

// Helper para obtener el nombre corto del mes
const getMonthShort = (dateStr: string | Date): string => {
  try {
    const date = new Date(dateStr);
    // 'es-ES' para meses en español (ej. 'oct.')
    return date.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
  } catch (e) {
    return 'Unk';
  }
};

interface DashboardData {
  proyectosActivos: number;
  totalEmpleados: number;
  solicitudesDineroPendientes: number;
  solicitudesMaterialesPendientes: number;
  rentabilidadProyectos: { nombre: string; rentabilidad: number }[];
  ultimasSolicitudesDinero: SolicitudDinero[];
  ultimasSolicitudesMateriales: SolicitudMaterial[];
  // --- Datos para nuevos gráficos ---
  distribucionEmpleados: { name: string; value: number }[];
  flujoCaja: { mes: string; ingresos: number; costos: number }[];
}

const Dashboard = () => {
  const { user, loading: authLoading, canAccess } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // helper seguro para extraer data de PromiseSettledResult
  const safeGetData = <T,>(r: PromiseSettledResult<any>): T => {
    if (r && (r as PromiseFulfilledResult<any>).status === 'fulfilled') {
      const fulfilled = r as PromiseFulfilledResult<any>;
      return (fulfilled.value?.data ?? []) as T;
    }
    return ([] as unknown) as T;
  };

  const canViewDashboard = (() => {
    if (!user) return false;
   const userRole = (user.rol || '').toString().toLowerCase();
    if (userRole.includes('ceo') || userRole.includes('gerente general')) return true;
    const módulosClave = ['proyectos', 'reportes', 'finanzas'];
    return módulosClave.some((m) => canAccess(m));
  })();

  useEffect(() => {
    // Si el auth todavía carga o el usuario no puede ver dashboard, no pedimos nada
    if (authLoading) return;
    if (!canViewDashboard) {
      setLoading(false);
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const promises = [
          apiClient.get<Proyecto[]>('/proyectos'),
          apiClient.get<Empleado[]>('/empleados'),
          apiClient.get<SolicitudDinero[]>('/solicitudesDinero'),
          apiClient.get<SolicitudMaterial[]>('/solicitudesMateriales'),
          apiClient.get<Finanza[]>('/finanzas'),
        ];

        const results = await Promise.allSettled(promises);

        const endpoints = ['/proyectos', '/empleados', '/solicitudesDinero', '/solicitudesMateriales', '/finanzas'];
        results.forEach((r, idx) => {
          if (r.status === 'rejected') {
            const reason = (r as PromiseRejectedResult).reason;
            const status = reason?.response?.status;
            if (status === 403) {
              toast.error(`Sin permiso para ${endpoints[idx]}. Algunos datos pueden faltar.`);
            } else {
              console.error(`Error cargando ${endpoints[idx]}:`, reason);
            }
          }
        });

        // Extraer datos con seguridad
        const proyectosData = safeGetData<Proyecto[]>(results[0]);
        const empleadosData = safeGetData<Empleado[]>(results[1]);
        const solDineroData = safeGetData<SolicitudDinero[]>(results[2]);
        const solMaterialesData = safeGetData<SolicitudMaterial[]>(results[3]);
        const finanzasData = safeGetData<Finanza[]>(results[4]);

        // --- Cálculos de Rentabilidad (Existente) ---
        const rentabilidadProyectos = (proyectosData || []).map((proyecto) => {
          const ingresos = (finanzasData || [])
            .filter((f) => Number(f.proyectoId) === Number(proyecto.id) && String(f.tipo) === 'Ingreso')
            .reduce((sum, f) => sum + (Number(f.monto) || 0), 0);
          const costos = (finanzasData || [])
            .filter((f) => Number(f.proyectoId) === Number(proyecto.id) && String(f.tipo) === 'Costo')
            .reduce((sum, f) => sum + (Number(f.monto) || 0), 0);
          return {
            nombre: proyecto?.nombre ? String(proyecto.nombre).split(' ')[0] : '—',
            rentabilidad: ingresos - costos,
          };
        });

        // --- Nuevos Cálculos (de la v2 de diseño) ---

        // 1. Distribución de Empleados (Pie Chart)
        const distribucionEmpleados = (proyectosData || []).map(proyecto => ({
          name: proyecto?.nombre ? String(proyecto.nombre).split(' ')[0] : '—',
          value: (empleadosData || []).filter(e => Number(e.proyectoAsignadoId) === Number(proyecto.id)).length
        })).filter(d => d.value > 0); // Opcional: filtrar proyectos sin empleados

        // 2. Flujo de Caja (Line Chart)
        const flujoCajaMap = new Map<string, { mes: string; ingresos: number; costos: number; yearMonth: string }>();

        (finanzasData || []).forEach(f => {
          if (!f.fecha || !f.monto || !f.tipo) return;

          try {
            const date = new Date(f.fecha);
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // '2023-10'
            const mes = getMonthShort(date); // 'oct'

            if (!flujoCajaMap.has(yearMonth)) {
              flujoCajaMap.set(yearMonth, { mes: mes.charAt(0).toUpperCase() + mes.slice(1), ingresos: 0, costos: 0, yearMonth });
            }

            const entry = flujoCajaMap.get(yearMonth)!;

            if (String(f.tipo) === 'Ingreso') {
              entry.ingresos += Number(f.monto) || 0;
            } else if (String(f.tipo) === 'Costo') {
              entry.costos += Number(f.monto) || 0;
            }
          } catch (e) {
            console.warn("Fecha inválida en finanzas:", f.fecha);
          }
        });

        // Ordenar por mes y tomar los últimos 6
        const flujoCaja = Array.from(flujoCajaMap.values())
          .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
          .slice(-6); // Mostrar solo los últimos 6 meses

        // --- Ensamblar Data ---

        const dashboardData: DashboardData = {
          proyectosActivos: (proyectosData || []).filter((p) => p?.estado === 'En Curso').length,
          totalEmpleados: (empleadosData || []).length,
          solicitudesDineroPendientes: (solDineroData || []).filter((s) => s?.estado === 'Pendiente').length,
          solicitudesMaterialesPendientes: (solMaterialesData || []).filter((s) => s?.estado === 'Pendiente').length,
          rentabilidadProyectos,
          ultimasSolicitudesDinero: (solDineroData || []).filter((s) => s?.estado === 'Pendiente').slice(0, 3),
          ultimasSolicitudesMateriales: (solMaterialesData || []).filter((s) => s?.estado === 'Pendiente').slice(0, 3),
          // Nuevos
          distribucionEmpleados,
          flujoCaja,
        };

        setData(dashboardData);
      } catch (err) {
        console.error('Error general cargando dashboard:', err);
        toast.error('No se pudo cargar el resumen del dashboard');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, canViewDashboard, user]);

  // Si el usuario no tiene permiso para ver el dashboard mostramos mensaje claro
  if (!canViewDashboard && !authLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard General</h1>
            <p className="text-muted-foreground">Centro de comando ejecutivo</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acceso denegado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">No tienes permisos para ver el dashboard. Consulta con el administrador.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard General</h1>
            <p className="text-muted-foreground">Centro de comando ejecutivo</p>
          </div>
          <p>Cargando datos...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard General</h1>
          <p className="text-muted-foreground">No se pudieron cargar los datos.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard General</h1>
          <p className="text-muted-foreground">Centro de comando ejecutivo</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Proyectos Activos</CardTitle>
              <Building2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{data.proyectosActivos}</div>
              <p className="text-xs text-success mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                En desarrollo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Empleados Totales</CardTitle>
              <Users className="h-5 w-5 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{data.totalEmpleados}</div>
              <p className="text-xs text-muted-foreground mt-1">Activos en proyectos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Solicitudes Dinero</CardTitle>
              <DollarSign className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{data.solicitudesDineroPendientes}</div>
              <p className="text-xs text-warning mt-1">
                <AlertCircle className="inline h-3 w-3 mr-1" />
                Pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Solicitudes Materiales</CardTitle>
              <Package className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{data.solicitudesMaterialesPendientes}</div>
              <p className="text-xs text-warning mt-1">
                <AlertCircle className="inline h-3 w-3 mr-1" />
                Pendientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos (Layout de 2 columnas) */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gráfico 1: Rentabilidad (Barra) */}
          <Card>
            <CardHeader>
              <CardTitle>Rentabilidad por Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.rentabilidadProyectos}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="nombre" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="rentabilidad" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico 2: Distribución (Torta) */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Empleados</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.distribucionEmpleados}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100} // Ajustado a 100 para más espacio
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.distribucionEmpleados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico 3: Flujo de Caja (Línea) */}
        <Card>
          <CardHeader>
            <CardTitle>Flujo de Caja (Últimos 6 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.flujoCaja}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="hsl(var(--success))" strokeWidth={2} />
                <Line type="monotone" dataKey="costos" stroke="hsl(var(--destructive))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Solicitudes Críticas */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Críticas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Solicitudes de Dinero</h4>
                <div className="space-y-2">
                  {data.ultimasSolicitudesDinero.length > 0 ? (
                    data.ultimasSolicitudesDinero.map((sol) => (
                      <div key={sol.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{sol.motivo}</p>
                          <p className="text-xs text-muted-foreground">{sol.solicitante}</p>
                        </div>
                        <span className="font-bold text-warning">${sol.monto?.toLocaleString?.() ?? sol.monto}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No hay solicitudes de dinero pendientes.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Solicitudes de Materiales</h4>
                <div className="space-y-2">
                  {data.ultimasSolicitudesMateriales.length > 0 ? (
                    data.ultimasSolicitudesMateriales.map((sol) => (
                      <div key={sol.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{sol.item}</p>
                          <p className="text-xs text-muted-foreground">{sol.solicitante}</p>
                        </div>
                        <span className="font-bold text-accent">{sol.cantidad ?? '—'} unidades</span>
                      </div>
                    ))
                  ) : (
                     <p className="text-sm text-muted-foreground italic">No hay solicitudes de materiales pendientes.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;