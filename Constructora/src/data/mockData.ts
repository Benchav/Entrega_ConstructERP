// Copiar y pegar todo el contenido en src/data/mockData.ts
// Importar todas las interfaces necesarias
import {
    Usuario, Proyecto, InventarioItem, Empleado, Finanza, Licitacion,
    Plano, ReporteDiario, SolicitudMaterial, SolicitudDinero,
    OrdenCompra, InspeccionCalidad, IncidenteSeguridad
} from './models';

// Importar las constantes con los datos iniciales
import {
    initialUsuarios, initialProyectos, initialInventarioObra, initialEmpleados,
    initialFinanzas, initialLicitaciones, initialPlanos, initialReportesDiarios,
    initialSolicitudesMateriales, initialSolicitudesDinero, initialOrdenesCompra,
    initialInspeccionesCalidad, initialIncidentesSeguridad
} from './data';

// ====================================================================
// Variables Mock Mutables (Simulan la Base de Datos)
// ====================================================================

export let mockUsuarios: Usuario[] = initialUsuarios;
export let mockProyectos: Proyecto[] = initialProyectos;
export let mockInventarioObra: InventarioItem[] = initialInventarioObra;
export let mockEmpleados: Empleado[] = initialEmpleados;
export let mockFinanzas: Finanza[] = initialFinanzas;
export let mockLicitaciones: Licitacion[] = initialLicitaciones;
export let mockPlanos: Plano[] = initialPlanos;
export let mockReportesDiarios: ReporteDiario[] = initialReportesDiarios;
export let mockSolicitudesMateriales: SolicitudMaterial[] = initialSolicitudesMateriales;
export let mockSolicitudesDinero: SolicitudDinero[] = initialSolicitudesDinero;
export let mockOrdenesCompra: OrdenCompra[] = initialOrdenesCompra;
export let mockInspeccionesCalidad: InspeccionCalidad[] = initialInspeccionesCalidad;
export let mockIncidentesSeguridad: IncidenteSeguridad[] = initialIncidentesSeguridad;

// ====================================================================
// Funciones de Ayuda (Update Helpers)
// ====================================================================

export const updateUsuarios = (newData: Usuario[]) => {
  mockUsuarios = newData;
};

export const updateProyectos = (newData: Proyecto[]) => {
  mockProyectos = newData;
};

export const updateInventario = (newData: InventarioItem[]) => {
  mockInventarioObra = newData;
};

export const updateEmpleados = (newData: Empleado[]) => {
  mockEmpleados = newData;
};

export const updateFinanzas = (newData: Finanza[]) => {
  mockFinanzas = newData;
};

export const updateLicitaciones = (newData: Licitacion[]) => {
  mockLicitaciones = newData;
};

export const updatePlanos = (newData: Plano[]) => {
  mockPlanos = newData;
};

export const updateReportesDiarios = (newData: ReporteDiario[]) => {
  mockReportesDiarios = newData;
};

export const updateSolicitudesMateriales = (newData: SolicitudMaterial[]) => {
  mockSolicitudesMateriales = newData;
};

export const updateSolicitudesDinero = (newData: SolicitudDinero[]) => {
  mockSolicitudesDinero = newData;
};

export const updateOrdenesCompra = (newData: OrdenCompra[]) => {
  mockOrdenesCompra = newData;
};

export const updateInspeccionesCalidad = (newData: InspeccionCalidad[]) => {
  mockInspeccionesCalidad = newData;
};

export const updateIncidentesSeguridad = (newData: IncidenteSeguridad[]) => {
  mockIncidentesSeguridad = newData;
};