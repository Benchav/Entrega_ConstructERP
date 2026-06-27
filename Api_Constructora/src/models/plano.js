const { toOpenApiSchema } = require('./_schemaHelper');


const Plano = {
  id: { type: 'string', example: 'p1' },
  nombre: { type: 'string', example: 'Plano Estructural P1.pdf' },
  proyectoId: { type: 'integer', example: 100 },
  categoria: { type: 'string', example: 'Estructural' },
  fecha: { type: 'string', example: '2025-09-10' }
};

const PlanoSchema = toOpenApiSchema(Plano, {
  description: 'Plano completo'
});

const PlanoCreate = toOpenApiSchema(Plano, {
  required: ['nombre', 'proyectoId', 'categoria', 'fecha'],
  description: 'Payload para crear plano'
});

const PlanoUpdate = toOpenApiSchema(Plano, {
  description: 'Payload para actualizar plano'
});


function validateCreatePlano(payload) {
  const required = ['nombre', 'proyectoId', 'categoria', 'fecha'];
  const missing = required.filter(k => !payload[k]);
  return { ok: missing.length === 0, missing };
}

module.exports = {
  PlanoSchema,
  PlanoCreate,
  PlanoUpdate,
  validateCreatePlano
};