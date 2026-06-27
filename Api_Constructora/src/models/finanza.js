const { toOpenApiSchema } = require('./_schemaHelper');


const Finanza = {
  id: { type: 'string', example: 'f1' },
  tipo: { type: 'string', example: 'Ingreso' },
  proyectoId: { type: 'integer', example: 100 },
  categoria: { type: 'string', example: 'Materiales' },
  descripcion: { type: 'string', example: 'Compra Acero' },
  monto: { type: 'number', example: 15000 },
  fecha: { type: 'string', example: '2025-10-18' }
};


const FinanzaSchema = toOpenApiSchema(Finanza, {
  description: 'Registro financiero completo'
});

const FinanzaCreate = toOpenApiSchema(Finanza, {
  required: ['tipo', 'proyectoId', 'descripcion', 'monto', 'fecha'],
  description: 'Payload para crear registro financiero'
});

const FinanzaUpdate = toOpenApiSchema(Finanza, {
  description: 'Payload para actualizar registro financiero'
});


function validateCreateFinanza(payload) {
  const required = ['tipo', 'proyectoId', 'descripcion', 'monto', 'fecha'];
  const missing = required.filter(k => !payload[k]);
  return { ok: missing.length === 0, missing };
}

module.exports = {
  FinanzaSchema,
  FinanzaCreate,
  FinanzaUpdate,
  validateCreateFinanza
};