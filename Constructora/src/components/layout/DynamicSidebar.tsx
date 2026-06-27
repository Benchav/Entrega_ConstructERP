import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Building2, 
  DollarSign, 
  Users, 
  Package, 
  FileText, 
  Briefcase,
  HardHat,
  ClipboardList,
  FileStack,
  ShoppingCart,
  UserCog,
  Truck,
  Shield,
  CheckCircle,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';


const normalize = (text?: string) =>
  (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['CEO', 'Gerente General', 'Director de Proyectos', 'Director Finanzas', 'Director Comercial', 'Jefe Oficina Tecnica'] },
  { label: 'Todos los Proyectos', path: '/proyectos', icon: Building2, roles: ['CEO', 'Gerente General', 'Director de Proyectos'] },
  { label: 'Portafolio', path: '/portafolio', icon: Trophy, roles: ['CEO', 'Gerente General'] },
  { label: 'Mi Proyecto', path: '/mi-proyecto', icon: HardHat, roles: ['Jefe de Obra', 'Maestro de Obra'] },
  { label: 'Finanzas', path: '/finanzas', icon: DollarSign, roles: ['CEO', 'Gerente General', 'Director Finanzas', 'Asistente Administrativo'] },
  { label: 'Órdenes de Compra', path: '/compras', icon: Truck, roles: ['CEO', 'Gerente General', 'Jefe de Logística'] },
  { label: 'Inventario Total', path: '/inventario-total', icon: Package, roles: ['CEO', 'Gerente General', 'Director de Proyectos', 'Jefe de Logística'] },
  { label: 'Inventario Mi Obra', path: '/inventario', icon: ShoppingCart, roles: ['Jefe de Obra', 'Bodeguero'] },
  { label: 'Reportes Diarios', path: '/reportes', icon: ClipboardList, roles: ['Jefe de Obra', 'Maestro de Obra'] },
  { label: 'Planos y Docs', path: '/planos', icon: FileText, roles: ['CEO', 'Gerente General', 'Director de Proyectos', 'Jefe Oficina Tecnica', 'Jefe de Obra', 'Maestro de Obra', 'Albañil', 'Operador de Maquinaria'] },
  { label: 'Control de Calidad', path: '/calidad', icon: CheckCircle, roles: ['Director de Proyectos', 'Jefe Oficina Tecnica', 'Jefe de Obra'] },
  { label: 'Seguridad y EPP', path: '/seguridad', icon: Shield, roles: ['Director de Proyectos', 'Jefe de Obra', 'Maestro de Obra'] },
  { label: 'Licitaciones', path: '/licitaciones', icon: Briefcase, roles: ['CEO', 'Gerente General', 'Director Comercial'] },
  { label: 'Solicitudes', path: '/solicitudes', icon: FileStack, roles: ['CEO', 'Gerente General', 'Director de Proyectos', 'Director Finanzas', 'Jefe de Obra'] },
  { label: 'Gestión de Personal', path: '/rrhh', icon: Users, roles: ['CEO', 'Gerente General', 'RRHH'] },
  { label: 'Gestión de Usuarios', path: '/usuarios', icon: UserCog, roles: ['CEO', 'Gerente General'] },
];

export const DynamicSidebar = () => {
  const { user, loading } = useAuth();


  if (loading) {
    return (
      <aside className="h-full bg-sidebar border-r flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Cargando menú...</span>
      </aside>
    );
  }

  if (!user) return null; 

  const userRolNorm = normalize(user.rol);


  const filteredItems =
  userRolNorm === 'ceo' || userRolNorm === 'gerente general'
      ? navItems
      : navItems.filter(item =>
          item.roles.some(r => normalize(r) === userRolNorm)
        );

  return (
    <aside className="h-full bg-sidebar border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-2">Navegación</h2>
        <p className="text-xs text-muted-foreground capitalize">{user.rol}</p>
      </div>
      
      <nav className="px-3 pb-4">
        <ul className="space-y-1">
          {filteredItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};