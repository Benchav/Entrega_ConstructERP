const GenericService = require('./genericService');

const proyectosService = new GenericService('proyectos', {
  idField: 'id',
  idIsNumber: true
});

module.exports = proyectosService;