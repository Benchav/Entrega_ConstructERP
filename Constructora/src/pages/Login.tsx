// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const normalize = (s?: string) => String(s || '').toLowerCase().trim();

const getRedirectPathFromNormalizedRole = (normRole: string): string => {
  if (!normRole) return '/dashboard';
  if (['ceo', 'gerente general', 'director de proyectos', 'director finanzas', 'director comercial', 'jefe oficina tecnica'].includes(normRole)) return '/dashboard';
  if (['jefe de obra', 'maestro de obra'].includes(normRole)) return '/mi-proyecto';
  if (normRole === 'bodeguero') return '/inventario';
  if (normRole === 'jefe de logística') return '/compras';
  if (normRole === 'rrhh') return '/rrhh';
  if (normRole === 'asistente administrativo') return '/finanzas';
  if (['albanil', 'operador de maquinaria'].includes(normRole)) return '/planos';
  return '/dashboard';
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user: any = await login(username, password);
      if (user) {
        const rolRaw = user.rol || user.role || user?.perfil || '';
        const norm = normalize(rolRaw);
        const path = from || getRedirectPathFromNormalizedRole(norm);
        navigate(path, { replace: true });
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.message || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center">
            <Building2 className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">ConstructERP</CardTitle>
          <CardDescription className="text-base">
            Sistema de Gestión para Constructoras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;