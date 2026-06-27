// src/App.tsx
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Proyectos from './pages/Proyectos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import GestionUsuarios from './pages/GestionUsuarios';
import GestionInventario from './pages/GestionInventario';
import GestionFinanzas from './pages/GestionFinanzas';
import GestionRRHH from './pages/GestionRRHH';
import GestionLicitaciones from './pages/GestionLicitaciones';
import GestionPlanos from './pages/GestionPlanos';
import GestionReportes from './pages/GestionReportes';
import MiProyecto from './pages/MiProyecto';
import InventarioTotal from './pages/InventarioTotal';
import Solicitudes from './pages/Solicitudes';
import GestionCompras from './pages/GestionCompras';
import GestionCalidad from './pages/GestionCalidad';
import GestionSeguridad from './pages/GestionSeguridad';
import NotFound from './pages/NotFound';
import Portafolio from './pages/Portafolio';

const queryClient = new QueryClient();

//  Roles y permisos
const ROLES = {
  CEO: "ceo",
  GERENTE_GENERAL: "gerente general",
  DIR_PROYECTOS: "director de proyectos",
  DIR_FINANZAS: "director finanzas",
  DIR_COMERCIAL: "director comercial",
  JEFE_OT: "jefe oficina tecnica",
  JEFE_LOGISTICA: "jefe de logistica",
  JEFE_OBRA: "jefe de obra",
  MAESTRO_OBRA: "maestro de obra",
  BODEGUERO: "bodeguero",
  RRHH: "rrhh",
  ADMIN: "asistente administrativo",
  OPERADOR: "operador de maquinaria",
  ALBANIL: "albanil",
};


//  Mapeo de rutas a roles permitidos
const ROUTE_ROLES = {
  dashboard: [ROLES.CEO, ROLES.GERENTE_GENERAL, ROLES.DIR_PROYECTOS, ROLES.DIR_FINANZAS, ROLES.DIR_COMERCIAL, ROLES.JEFE_OT],
  proyectos: [ROLES.CEO, ROLES.GERENTE_GENERAL, ROLES.DIR_PROYECTOS],
  portafolio: [ROLES.CEO, ROLES.GERENTE_GENERAL],
  miProyecto: [ROLES.JEFE_OBRA, ROLES.MAESTRO_OBRA],
  usuarios: [ROLES.CEO, ROLES.GERENTE_GENERAL],
  inventario: [ROLES.JEFE_OBRA, ROLES.BODEGUERO],
  inventarioTotal: [ROLES.CEO, ROLES.GERENTE_GENERAL, ROLES.DIR_PROYECTOS, ROLES.JEFE_LOGISTICA],
  finanzas: [ROLES.CEO, ROLES.GERENTE_GENERAL, ROLES.DIR_FINANZAS, ROLES.ADMIN],
  rrhh: [ROLES.CEO, ROLES.GERENTE_GENERAL, ROLES.RRHH],
  licitaciones: [ROLES.CEO, ROLES.GERENTE_GENERAL, ROLES.DIR_COMERCIAL],
  planos: [ROLES.CEO, ROLES.GERENTE_GENERAL, ROLES.DIR_PROYECTOS, ROLES.JEFE_OT, ROLES.JEFE_OBRA, ROLES.MAESTRO_OBRA, ROLES.ALBANIL, ROLES.OPERADOR],
  reportes: [ROLES.JEFE_OBRA, ROLES.MAESTRO_OBRA],
  solicitudes: [ROLES.CEO, ROLES.GERENTE_GENERAL, ROLES.DIR_PROYECTOS, ROLES.DIR_FINANZAS, ROLES.JEFE_OBRA],
  compras: [ROLES.CEO, ROLES.GERENTE_GENERAL, ROLES.JEFE_LOGISTICA],
  calidad: [ROLES.DIR_PROYECTOS, ROLES.JEFE_OT, ROLES.JEFE_OBRA],
  seguridad: [ROLES.DIR_PROYECTOS, ROLES.JEFE_OBRA, ROLES.MAESTRO_OBRA],
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* RUTA PÚBLICA */}
            <Route path="/" element={<Login />} />

            {/* RUTAS PROTEGIDAS */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute roles={ROUTE_ROLES.dashboard}><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/proyectos"
              element={<ProtectedRoute roles={ROUTE_ROLES.proyectos}><Proyectos /></ProtectedRoute>}
            />
            <Route
              path="/portafolio"
              element={<ProtectedRoute roles={ROUTE_ROLES.portafolio}><Portafolio /></ProtectedRoute>}
            />
            <Route
              path="/proyecto/:id"
              element={<ProtectedRoute roles={ROUTE_ROLES.proyectos}><ProyectoDetalle /></ProtectedRoute>}
            />
            <Route
              path="/mi-proyecto"
              element={<ProtectedRoute roles={ROUTE_ROLES.miProyecto}><MiProyecto /></ProtectedRoute>}
            />
            <Route
              path="/usuarios"
              element={<ProtectedRoute roles={ROUTE_ROLES.usuarios}><GestionUsuarios /></ProtectedRoute>}
            />
            <Route
              path="/inventario"
              element={<ProtectedRoute roles={ROUTE_ROLES.inventario}><GestionInventario /></ProtectedRoute>}
            />
            <Route
              path="/inventario-total"
              element={<ProtectedRoute roles={ROUTE_ROLES.inventarioTotal}><InventarioTotal /></ProtectedRoute>}
            />
            <Route
              path="/finanzas"
              element={<ProtectedRoute roles={ROUTE_ROLES.finanzas}><GestionFinanzas /></ProtectedRoute>}
            />
            <Route
              path="/rrhh"
              element={<ProtectedRoute roles={ROUTE_ROLES.rrhh}><GestionRRHH /></ProtectedRoute>}
            />
            <Route
              path="/licitaciones"
              element={<ProtectedRoute roles={ROUTE_ROLES.licitaciones}><GestionLicitaciones /></ProtectedRoute>}
            />
            <Route
              path="/planos"
              element={<ProtectedRoute roles={ROUTE_ROLES.planos}><GestionPlanos /></ProtectedRoute>}
            />
            <Route
              path="/reportes"
              element={<ProtectedRoute roles={ROUTE_ROLES.reportes}><GestionReportes /></ProtectedRoute>}
            />
            <Route
              path="/solicitudes"
              element={<ProtectedRoute roles={ROUTE_ROLES.solicitudes}><Solicitudes /></ProtectedRoute>}
            />
            <Route
              path="/compras"
              element={<ProtectedRoute roles={ROUTE_ROLES.compras}><GestionCompras /></ProtectedRoute>}
            />
            <Route
              path="/calidad"
              element={<ProtectedRoute roles={ROUTE_ROLES.calidad}><GestionCalidad /></ProtectedRoute>}
            />
            <Route
              path="/seguridad"
              element={<ProtectedRoute roles={ROUTE_ROLES.seguridad}><GestionSeguridad /></ProtectedRoute>}
            />

            {/* RUTA POR DEFECTO */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;