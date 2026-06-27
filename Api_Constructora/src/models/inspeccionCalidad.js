const { toOpenApiSchema } = require('./_schemaHelper');

const InspeccionCalidad = {
  id: { type: 'string', example: 'ic1' },
  proyectoId: { type: 'integer', example: 100 },
  fecha: { type: 'string', example: '2025-10-20' },
  fase: { type: 'string', example: 'Cimentación' },
  resultado: { type: 'string', example: 'Aprobado' },
  observaciones: { type: 'string', example: 'Cumple con plano estructural.' }
};


const InspeccionCalidadSchema = toOpenApiSchema(InspeccionCalidad, {
  description: 'Inspección de calidad completa'
});

const InspeccionCalidadCreate = toOpenApiSchema(InspeccionCalidad, {
  required: ['proyectoId', 'fecha', 'fase', 'resultado'],
  description: 'Payload para crear inspección'
});

const InspeccionCalidadUpdate = toOpenApiSchema(InspeccionCalidad, {
  description: 'Payload para actualizar inspección'
});


function validateCreateInspeccionCalidad(payload) {
  const required = ['proyectoId', 'fecha', 'fase', 'resultado'];
  const missing = required.filter(k => !payload[k]);
  return { ok: missing.length === 0, missing };
}

module.exports = {
  InspeccionCalidadSchema,
  InspeccionCalidadCreate,
  InspeccionCalidadUpdate,
  validateCreateInspeccionCalidad
};