import { useState, useEffect } from 'react';
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Usuario, Proyecto } from '@/data/models';
import apiClient from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Building2 } from 'lucide-react';
import { toast } from 'sonner';

// Roles
const ROLES = [
  "CEO", "Gerente General", "Director de Proyectos", "Director Finanzas",
  "Director Comercial", "Jefe Oficina Tecnica", "Jefe de Logística",
  "Jefe de Obra", "Maestro de Obra", "Bodeguero", "RRHH",
  "Asistente Administrativo", "Operador de Maquinaria", "Albañil",
];


interface UsuarioFull extends Usuario {
  proyecto?: Proyecto; 
}

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioFull[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    rol: '',
    username: '',
    password: '',
    proyectoAsignadoId: '', 
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, projectsRes] = await Promise.all([
          apiClient.get<UsuarioFull[]>('/usuarios'), 
          apiClient.get<Proyecto[]>('/proyectos')    
        ]);
        setUsuarios(usersRes.data);
        setProyectos(projectsRes.data);
      } catch (error) {
        toast.error('Error al cargar datos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProjectName = (proyecto?: Proyecto) => {
    return proyecto ? proyecto.nombre : '-';
  };

  const filteredUsuarios = usuarios.filter(u =>
    (u.nombre && u.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resetForm = () => {
    setFormData({ nombre: '', rol: '', username: '', password: '', proyectoAsignadoId: '' });
  };

  const handleCreateOpenChange = (open: boolean) => {
    if (!open) resetForm();
    setIsCreateOpen(open);
  };

  const handleEditOpenChange = (open: boolean) => {
    if (!open) { setEditingUser(null); resetForm(); }
    setIsEditOpen(open);
  };


  const handleCreate = async () => {
    if (!formData.nombre || !formData.rol || !formData.username || !formData.password) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }
    try {
     
      const proyectoIdInt = formData.proyectoAsignadoId && formData.proyectoAsignadoId !== 'none'
        ? parseInt(formData.proyectoAsignadoId)
        : undefined;
      
      const proyectoAsignado = proyectoIdInt
        ? proyectos.find(p => p.id === proyectoIdInt)
        : undefined;

      const newUserPayload = { ...formData, proyectoAsignadoId: proyectoIdInt };

     
      const res = await apiClient.post<UsuarioFull>('/usuarios', newUserPayload);
      
      
      const nuevoUsuarioParaState: UsuarioFull = {
        ...res.data,
        proyecto: proyectoAsignado 
      };

    
      setUsuarios([...usuarios, nuevoUsuarioParaState]); 
      handleCreateOpenChange(false);
      toast.success('Usuario creado exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleEdit = (user: UsuarioFull) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre || '',
      rol: user.rol || '',
      username: user.username || '',
      password: '',
      proyectoAsignadoId: user.proyectoAsignadoId?.toString() || 'none',
    });
    handleEditOpenChange(true);
  };

const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      
      const proyectoIdInt = formData.proyectoAsignadoId && formData.proyectoAsignadoId !== 'none'
        ? parseInt(formData.proyectoAsignadoId)
        : undefined;

      const proyectoAsignado = proyectoIdInt
        ? proyectos.find(p => p.id === proyectoIdInt)
        : undefined;
      
      const updatedData: any = {
        nombre: formData.nombre,
        rol: formData.rol,
        username: formData.username,
        proyectoAsignadoId: proyectoIdInt,
      };
      if (formData.password) updatedData.password = formData.password;

      
      const res = await apiClient.put<UsuarioFull>(`/usuarios/${editingUser.id}`, updatedData);
      
      
      const updatedUsuarioParaState: UsuarioFull = {
        ...res.data,
        proyecto: proyectoAsignado 
      };

      
      setUsuarios(usuarios.map(u => (u.id === editingUser.id ? updatedUsuarioParaState : u))); 
      handleEditOpenChange(false);
      toast.success('Usuario actualizado exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await apiClient.delete(`/usuarios/${id}`);
        setUsuarios(usuarios.filter(u => u.id !== id));
        toast.success('Usuario eliminado exitosamente');
        if (editingUser && editingUser.id === id) handleEditOpenChange(false);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error al eliminar usuario');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administre los usuarios del sistema</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Nuevo Usuario</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Crear Nuevo Usuario</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label htmlFor="nombre">Nombre Completo</Label><Input id="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} /></div>
                <div>
                  <Label htmlFor="rol">Rol</Label>
                  <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione un rol" /></SelectTrigger>
                    <SelectContent>{ROLES.map(rol => (<SelectItem key={rol} value={rol}>{rol}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="username">Usuario</Label><Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} /></div>
                <div><Label htmlFor="password">Contraseña</Label><Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
                <div>
                  <Label htmlFor="proyecto">Proyecto Asignado (Opcional)</Label>
                  <Select value={formData.proyectoAsignadoId} onValueChange={(value) => setFormData({ ...formData, proyectoAsignadoId: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione un proyecto" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      {proyectos.map(p => (<SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Crear Usuario</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre o usuario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Proyecto Asignado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (<TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>) 
                  : filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nombre}</TableCell>
                      <TableCell>{usuario.username}</TableCell>
                      <TableCell>{usuario.rol}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {usuario.proyecto && <Building2 className="h-4 w-4 text-muted-foreground" />}
                          {getProjectName(usuario.proyecto)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(usuario)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDelete(usuario.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Edición */}
        <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar Usuario</DialogTitle></DialogHeader>
            <div className="space-y-4">
                <div><Label htmlFor="edit-nombre">Nombre Completo</Label><Input id="edit-nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} /></div>
                <div>
                  <Label htmlFor="edit-rol">Rol</Label>
                  <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione un rol" /></SelectTrigger>
                    <SelectContent>{ROLES.map(rol => (<SelectItem key={rol} value={rol}>{rol}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="edit-username">Usuario</Label><Input id="edit-username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} /></div>
                <div><Label htmlFor="edit-password">Contraseña (dejar vacío para no cambiar)</Label><Input id="edit-password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
                <div>
                  <Label htmlFor="edit-proyecto">Proyecto Asignado</Label>
                  <Select value={formData.proyectoAsignadoId} onValueChange={(value) => setFormData({ ...formData, proyectoAsignadoId: value })}>
                    <SelectTrigger><SelectValue placeholder="Seleccione un proyecto" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      {proyectos.map(p => (<SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleEditOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleUpdate}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
};

export default GestionUsuarios;