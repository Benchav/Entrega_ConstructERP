const { toOpenApiSchema } = require('./_schemaHelper');


const SolicitudDinero = {
  id: { type: 'string', example: 'sd1' },
  proyectoId: { type: 'integer', example: 101 },
  motivo: { type: 'string', example: 'Pago planilla' },
  monto: { type: 'number', example: 15000 },
  estado: { type: 'string', example: 'Aprobada' },
  solicitante: { type: 'string', example: 'Jefe Obra X' },
  fecha: { type: 'string', example: '2025-10-20' }
};


const SolicitudDineroSchema = toOpenApiSchema(SolicitudDinero, {
  description: 'Solicitud de dinero completa'
});

const SolicitudDineroCreate = toOpenApiSchema(SolicitudDinero, {
  required: ['proyectoId', 'motivo', 'monto', 'solicitante', 'fecha'],
  description: 'Payload para crear solicitud de dinero'
});

const SolicitudDineroUpdate = toOpenApiSchema(SolicitudDinero, {
  description: 'Payload para actualizar solicitud de dinero'
});


function validateCreateSolicitudDinero(payload) {
  const required = ['proyectoId', 'motivo', 'monto', 'solicitante', 'fecha'];
  const missing = required.filter(k => !payload[k]);
  return { ok: missing.length === 0, missing };
}

module.exports = {
  SolicitudDineroSchema,
  SolicitudDineroCreate,
  SolicitudDineroUpdate,
  validateCreateSolicitudDinero
};