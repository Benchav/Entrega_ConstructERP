// Copiar y pegar todo el contenido en src/data/models.ts
export interface Usuario {
  id: number;
  nombre: string;
  rol: string;
  username: string;
  password: string;
  proyectoAsignadoId?: number;
}

export interface Proyecto {
  id: number;
  nombre: string;
  ubicacion: string;
  estado: string;
  avance: number;
  presupuesto: number;
}

export interface InventarioItem {
  id: number;
  item: string;
  unidad: string;
  stock: number;
  proyectoId: number;
}

export interface Empleado {
  id: number;
  nombre: string;
  puesto: string;
  proyectoAsignadoId: number;
  salario: number;
}

export interface Finanza {
  id: string;
  tipo: "Ingreso" | "Costo";
  proyectoId: number;
  descripcion: string;
  monto: number;
  categoria?: string;
  fecha?: string;
}

export interface Licitacion {
  id: string;
  nombre: string;
  estado: string;
  monto: number;
  fechaLimite?: string;
}

export interface Plano {
  id: string;
  nombre: string;
  proyectoId: number;
  categoria: string;
  fecha?: string;
}

export interface ReporteDiario {
  id: string;
  fecha: string;
  proyectoId: number;
  creadoPor: string;
  resumen: string;
}

export interface SolicitudMaterial {
  id: string;
  proyectoId: number;
  item: string;
  cantidad: number;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  solicitante: string;
  fecha?: string;
}

export interface SolicitudDinero {
  id: string;
  proyectoId: number;
  motivo: string;
  monto: number;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  solicitante: string;
  fecha?: string;
}

export interface OrdenCompra {
  id: string;
  proyectoId: number;
  fechaPedido: string;
  proveedor: string;
  items: string;
  montoTotal: number;
  estado: "Pendiente" | "Emitida" | "Recibida" | "Cancelada";
}

export interface InspeccionCalidad {
  id: string;
  proyectoId: number;
  fecha: string;
  fase: string;
  resultado: "Aprobado" | "Con Observaciones" | "Rechazado";
  observaciones: string;
}

export interface IncidenteSeguridad {
  id: string;
  proyectoId: number;
  fecha: string;
  tipo: "Accidente" | "Incidente" | "Inspección";
  descripcion: string;
  responsable: string;
}