// Copiar y pegar todo el contenido en src/data/data.ts
import {
    Usuario, Proyecto, InventarioItem, Empleado, Finanza, Licitacion,
    Plano, ReporteDiario, SolicitudMaterial, SolicitudDinero,
    OrdenCompra, InspeccionCalidad, IncidenteSeguridad
} from './models';

// ====================================================================
// Datos Iniciales (Constantes)
// ====================================================================

export const initialUsuarios: Usuario[] = [
    { id: 1, nombre: "Ana Martínez", rol: "CEO", username: "ceo", password: "123" },
    { id: 2, nombre: "Juan Pérez", rol: "Jefe de Obra", username: "jefe.juan", password: "123", proyectoAsignadoId: 100 },
    { id: 3, nombre: "Pedro Gil", rol: "Bodeguero", username: "bodega.pedro", password: "123", proyectoAsignadoId: 100 },
    { id: 4, nombre: "Lucía Vera", rol: "RRHH", username: "rrhh.lucia", password: "123" },
    { id: 5, nombre: "Marcos Díaz", rol: "Director de Proyectos", username: "dir.proyectos", password: "123" },
    { id: 6, nombre: "Elena Sol", rol: "Maestro de Obra", username: "maestro.elena", password: "123", proyectoAsignadoId: 100 },
    { id: 7, nombre: "Carlos Ruiz", rol: "Director Finanzas", username: "dir.finanzas", password: "123" },
    { id: 8, nombre: "Sofia Luna", rol: "Director Comercial", username: "dir.comercial", password: "123" },
    { id: 9, nombre: "Miguel Roca", rol: "Jefe Oficina Tecnica", username: "jefe.tecnica", password: "123" },
    { id: 10, nombre: "Luis Vega", rol: "Gerente General", username: "gerente.luis", password: "123" },
    { id: 11, nombre: "Roberto Gómez", rol: "Jefe de Logística", username: "jefe.logistica", password: "123" },
    { id: 12, nombre: "David P.", rol: "Albañil", username: "david.p", password: "123", proyectoAsignadoId: 100 },
    { id: 13, nombre: "Sara Nieto", rol: "Asistente Administrativo", username: "asist.sara", password: "123" },
    { id: 14, nombre: "Ernesto C.", rol: "Operador de Maquinaria", username: "op.ernesto", password: "123", proyectoAsignadoId: 101 }
];

export const initialProyectos: Proyecto[] = [
    { id: 100, nombre: "Torre Central", ubicacion: "Av. Principal #123", estado: "En Curso", avance: 65, presupuesto: 5000000 },
    { id: 101, nombre: "Residencial Los Alpes", ubicacion: "Calle Los Pinos #456", estado: "En Curso", avance: 40, presupuesto: 3500000 },
    { id: 102, nombre: "Puente Libertad", ubicacion: "Ruta 5 Km 20", estado: "Completado", avance: 100, presupuesto: 1200000 }
];

export const initialInventarioObra: InventarioItem[] = [
    { id: 50, item: "Cemento Portland", unidad: "sacos", stock: 100, proyectoId: 100 },
    { id: 51, item: "Acero Corrugado 1/2", unidad: "toneladas", stock: 15, proyectoId: 100 },
    { id: 52, item: "Ladrillo Fiscal", unidad: "millar", stock: 20, proyectoId: 101 },
    { id: 53, item: "Arena Fina", unidad: "m³", stock: 50, proyectoId: 100 },
    { id: 54, item: "Grava", unidad: "m³", stock: 40, proyectoId: 101 }
];

export const initialEmpleados: Empleado[] = [
    { id: 200, nombre: "Carlos Ruiz", puesto: "Albañil", proyectoAsignadoId: 100, salario: 1200 },
    { id: 201, nombre: "María López", puesto: "Armador", proyectoAsignadoId: 100, salario: 1300 },
    { id: 202, nombre: "José Arias", puesto: "Operador Maquinaria", proyectoAsignadoId: 101, salario: 1500 },
    { id: 203, nombre: "Ana Torres", puesto: "Electricista", proyectoAsignadoId: 100, salario: 1400 },
    { id: 204, nombre: "Luis Morales", puesto: "Plomero", proyectoAsignadoId: 101, salario: 1350 },
    { id: 205, nombre: "Felipe Soto", puesto: "Carpintero de Obra", proyectoAsignadoId: 100, salario: 1450 }
];

export const initialFinanzas: Finanza[] = [
    { id: "f1", tipo: "Ingreso", proyectoId: 100, descripcion: "Pago Avance 2", monto: 50000, fecha: "2025-10-15" },
    { id: "f2", tipo: "Costo", proyectoId: 100, categoria: "Materiales", descripcion: "Compra Acero", monto: 15000, fecha: "2025-10-18" },
    { id: "f3", tipo: "Ingreso", proyectoId: 101, descripcion: "Pago Inicial", monto: 80000, fecha: "2025-09-20" },
    { id: "f4", tipo: "Costo", proyectoId: 101, categoria: "Mano de Obra", descripcion: "Planilla Quincenal", monto: 25000, fecha: "2025-10-20" },
    { id: "f5", tipo: "Costo", proyectoId: 100, categoria: "Equipo", descripcion: "Alquiler Grúa", monto: 8000, fecha: "2025-10-22" }
];

export const initialLicitaciones: Licitacion[] = [
    { id: "l1", nombre: "Hospital Regional", estado: "Presentada", monto: 2500000, fechaLimite: "2025-11-15" },
    { id: "l2", nombre: "Puente Sur", estado: "En Preparacion", monto: 800000, fechaLimite: "2025-11-30" },
    { id: "l3", nombre: "Complejo Deportivo", estado: "Ganada", monto: 1800000, fechaLimite: "2025-10-01" }
];

export const initialPlanos: Plano[] = [
    { id: "p1", nombre: "Plano Estructural P1.pdf", proyectoId: 100, categoria: "Estructural", fecha: "2025-09-10" },
    { id: "p2", nombre: "Plano Eléctrico P1.pdf", proyectoId: 100, categoria: "Electricidad", fecha: "2025-09-12" },
    { id: "p3", nombre: "Plano Arquitectónico.pdf", proyectoId: 101, categoria: "Arquitectónico", fecha: "2025-08-20" },
    { id: "p4", nombre: "Plano Hidráulico.pdf", proyectoId: 100, categoria: "Hidráulico", fecha: "2025-09-15" }
];

export const initialReportesDiarios: ReporteDiario[] = [
    { id: "r1", fecha: "2025-10-24", proyectoId: 100, creadoPor: "Maestro de Obra Elena", resumen: "Se completó 50% de la mampostería del Nivel 1." },
    { id: "r2", fecha: "2025-10-23", proyectoId: 100, creadoPor: "Maestro de Obra Elena", resumen: "Instalación de tubería sanitaria en proceso." },
    { id: "r3", fecha: "2025-10-24", proyectoId: 101, creadoPor: "Jefe de Obra", resumen: "Excavación completada, inicio de cimentación." }
];

export const initialSolicitudesMateriales: SolicitudMaterial[] = [
    { id: "sm1", proyectoId: 100, item: "Acero 1/2", cantidad: 50, estado: "Pendiente", solicitante: "Juan Pérez", fecha: "2025-10-24" },
    { id: "sm2", proyectoId: 101, item: "Cemento", cantidad: 100, estado: "Aprobada", solicitante: "Jefe Obra", fecha: "2025-10-22" },
    { id: "sm3", proyectoId: 100, item: "Arena", cantidad: 20, estado: "Pendiente", solicitante: "Juan Pérez", fecha: "2025-10-25" }
];

export const initialSolicitudesDinero: SolicitudDinero[] = [
    { id: "sd1", proyectoId: 101, motivo: "Pago planilla", monto: 15000, estado: "Aprobada", solicitante: "Jefe Obra X", fecha: "2025-10-20" },
    { id: "sd2", proyectoId: 100, motivo: "Compra urgente materiales", monto: 8000, estado: "Pendiente", solicitante: "Juan Pérez", fecha: "2025-10-24" },
    { id: "sd3", proyectoId: 100, motivo: "Reparación equipo", monto: 3500, estado: "Pendiente", solicitante: "Elena Sol", fecha: "2025-10-25" }
];

export const initialOrdenesCompra: OrdenCompra[] = [
    { id: "oc1", proyectoId: 100, fechaPedido: "2025-10-20", proveedor: "Acero Rápido S.A.", items: "15 toneladas de Acero 1/2", montoTotal: 18000, estado: "Recibida" },
    { id: "oc2", proyectoId: 101, fechaPedido: "2025-10-25", proveedor: "Materiales El Fuerte", items: "200 sacos de Cemento, 5m³ de Grava", montoTotal: 6500, estado: "Emitida" },
    { id: "oc3", proyectoId: 100, fechaPedido: "2025-10-26", proveedor: "Ferretería Central", items: "Herramientas de mano", montoTotal: 1200, estado: "Pendiente" }
];

export const initialInspeccionesCalidad: InspeccionCalidad[] = [
    { id: "ic1", proyectoId: 100, fecha: "2025-10-20", fase: "Cimentación", resultado: "Aprobado", observaciones: "Las dimensiones y el refuerzo cumplen con el plano estructural." },
    { id: "ic2", proyectoId: 100, fecha: "2025-10-25", fase: "Mampostería Nivel 1", resultado: "Con Observaciones", observaciones: "Se detectó un desnivel de 5mm en el muro del Eje C. Pendiente corrección." },
    { id: "ic3", proyectoId: 101, fecha: "2025-10-15", fase: "Fundición de Zapatas", resultado: "Aprobado", observaciones: "Resistencia del concreto según lo solicitado." }
];

export const initialIncidentesSeguridad: IncidenteSeguridad[] = [
    { id: "is1", proyectoId: 100, fecha: "2025-10-24", tipo: "Incidente", descripcion: "Caída de herramienta desde 3m. No hubo lesionados, se acordonó el área.", responsable: "Jefe de Obra" },
    { id: "is2", proyectoId: 101, fecha: "2025-10-20", tipo: "Accidente", descripcion: "Corte leve en mano de Operador José Arias al manipular sierra circular (EPP incompleto).", responsable: "Maestro de Obra" },
    { id: "is3", proyectoId: 100, fecha: "2025-10-26", tipo: "Inspección", descripcion: "Inspección general de andamios. Todo conforme.", responsable: "Jefe de Obra" }
];