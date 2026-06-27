const { toOpenApiSchema } = require('./_schemaHelper');


const IncidenteSeguridad = {
  id: { type: 'string', example: 'is1' },
  proyectoId: { type: 'integer', example: 100 },
  fecha: { type: 'string', example: '2025-10-24' },
  tipo: { type: 'string', example: 'Incidente' },
  descripcion: { type: 'string', example: 'Caída de herramienta desde 3m.' },
  responsable: { type: 'string', example: 'Jefe de Obra' }
};


const IncidenteSeguridadSchema = toOpenApiSchema(IncidenteSeguridad, {
  description: 'Incidente de seguridad completo'
});

const IncidenteSeguridadCreate = toOpenApiSchema(IncidenteSeguridad, {
  required: ['proyectoId', 'fecha', 'tipo', 'descripcion'],
  description: 'Payload para crear incidente'
});

const IncidenteSeguridadUpdate = toOpenApiSchema(IncidenteSeguridad, {
  description: 'Payload para actualizar incidente'
});


function validateCreateIncidenteSeguridad(payload) {
  const required = ['proyectoId', 'fecha', 'tipo', 'descripcion'];
  const missing = required.filter(k => !payload[k]);
  return { ok: missing.length === 0, missing };
}

module.exports = {
  IncidenteSeguridadSchema,
  IncidenteSeguridadCreate,
  IncidenteSeguridadUpdate,
  validateCreateIncidenteSeguridad
};