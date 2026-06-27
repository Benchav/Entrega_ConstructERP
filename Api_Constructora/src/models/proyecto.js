const { toOpenApiSchema } = require('./_schemaHelper');


const Proyecto = {
  id: { type: 'integer', example: 100 },
  nombre: { type: 'string', example: 'Torre Central' },
  ubicacion: { type: 'string', example: 'Av. Principal #123' },
  estado: { type: 'string', example: 'En Curso' },
  avance: { type: 'integer', example: 65 },
  presupuesto: { type: 'number', example: 5000000 }
};


const ProyectoSchema = toOpenApiSchema(Proyecto, {
  description: 'Proyecto completo (respuesta)'
});


const ProyectoCreate = toOpenApiSchema(Proyecto, {
  required: ['nombre', 'ubicacion', 'estado', 'presupuesto'],
  description: 'Payload para crear un proyecto'
});


const ProyectoUpdate = toOpenApiSchema(Proyecto, {
  description: 'Payload para actualizar un proyecto (parcial)'
});




function validateCreateProyecto(payload) {

  const required = ['nombre', 'ubicacion', 'estado', 'presupuesto'];
  const missing = required.filter(k => payload[k] === undefined || payload[k] === null || payload[k] === '');
  return {
    ok: missing.length === 0,
    missing
  };
}

module.exports = {
  ProyectoSchema,
  ProyectoCreate,
  ProyectoUpdate,
  validateCreateProyecto
};