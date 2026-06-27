// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  roles: string[]; // roles "humanos" (ej: 'Director de Proyectos')
}

function normalize(text?: string) {
  return (text || '').normalize?.('NFD')?.replace(/[\u0300-\u036f]/g, '')?.toLowerCase()?.trim?.() || '';
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth) {
    // Contexto no disponible (no envuelto en AuthProvider)
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const { user, loading, canAccess, isAuthenticated } = auth;

  // Si el contexto todavía está cargando, mostramos un loader pequeño para evitar
  // redirecciones prematuras (esto evita que desaparezca la sidebar momentáneamente).
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Cargando sesión...</div>
      </div>
    );
  }

  // No autenticado: ir a login
  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Normalizamos rol de usuario y los roles permitidos
  const userRol = normalize(user.rol);
  const rolesNorm = roles.map(normalize);

  // CEO tiene acceso total
  if (userRol === 'ceo' || userRol === 'gerente general') return <>{children}</>;

  // Si el rol está explícitamente permitido para la ruta
  if (rolesNorm.includes(userRol)) return <>{children}</>;

  // Intentamos determinar el "módulo" desde la ruta. Usamos el primer segmento (más estable).
  // Ej: "/proyecto/123" -> "proyecto"; "/inventario" -> "inventario"
  const segments = location.pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] || '';
  const moduleCandidates = [
    firstSegment,                        // 'proyecto', 'inventario', 'finanzas', ...
    `${firstSegment}s`,                  // 'proyectos' (por si backend usa plural)
    location.pathname.replace(/^\//, ''), // fallback: toda la ruta sin '/'
  ].filter(Boolean).map(normalize);

  // Si canAccess devuelve true para alguno de los candidatos, permitimos.
  for (const candidate of moduleCandidates) {
    if (canAccess(candidate)) return <>{children}</>;
  }

  // No autorizado: redirigimos al dashboard (puedes cambiar a '/login' si prefieres)
  return <Navigate to="/notFound" replace />;
};