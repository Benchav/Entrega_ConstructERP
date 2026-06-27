const { toOpenApiSchema } = require('./_schemaHelper');


const Empleado = {
  id: { type: 'integer', example: 200 },
  nombre: { type: 'string', example: 'Carlos Ruiz' },
  puesto: { type: 'string', example: 'Albañil' },
  proyectoAsignadoId: { type: 'integer', example: 100 },
  salario: { type: 'number', example: 1200 }
};


const EmpleadoSchema = toOpenApiSchema(Empleado, {
  description: 'Empleado completo'
});

const EmpleadoCreate = toOpenApiSchema(Empleado, {
  required: ['nombre', 'puesto', 'salario'],
  description: 'Payload para crear empleado'
});

const EmpleadoUpdate = toOpenApiSchema(Empleado, {
  description: 'Payload para actualizar empleado'
});


function validateCreateEmpleado(payload) {
  const required = ['nombre', 'puesto', 'salario'];
  const missing = required.filter(k => !payload[k]);
  return { ok: missing.length === 0, missing };
}

module.exports = {
  EmpleadoSchema,
  EmpleadoCreate,
  EmpleadoUpdate,
  validateCreateEmpleado
};