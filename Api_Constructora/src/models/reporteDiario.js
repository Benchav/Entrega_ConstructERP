const { toOpenApiSchema } = require('./_schemaHelper');


const ReporteDiario = {
  id: { type: 'string', example: 'r1' },
  fecha: { type: 'string', example: '2025-10-24' },
  proyectoId: { type: 'integer', example: 100 },
  creadoPor: { type: 'string', example: 'Maestro de Obra Elena' },
  resumen: { type: 'string', example: 'Se completó 50% de la mampostería...' }
};


const ReporteDiarioSchema = toOpenApiSchema(ReporteDiario, {
  description: 'Reporte diario completo'
});

const ReporteDiarioCreate = toOpenApiSchema(ReporteDiario, {
  required: ['fecha', 'proyectoId', 'creadoPor', 'resumen'],
  description: 'Payload para crear reporte diario'
});

const ReporteDiarioUpdate = toOpenApiSchema(ReporteDiario, {
  description: 'Payload para actualizar reporte diario'
});


function validateCreateReporteDiario(payload) {
  const required = ['fecha', 'proyectoId', 'creadoPor', 'resumen'];
  const missing = required.filter(k => !payload[k]);
  return { ok: missing.length === 0, missing };
}

module.exports = {
  ReporteDiarioSchema,
  ReporteDiarioCreate,
  ReporteDiarioUpdate,
  validateCreateReporteDiario
};