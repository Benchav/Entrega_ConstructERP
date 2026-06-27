const GenericService = require('./genericService');

const empleadosService = new GenericService('empleados', {
  idField: 'id',
  idIsNumber: true
});

module.exports = empleadosService;