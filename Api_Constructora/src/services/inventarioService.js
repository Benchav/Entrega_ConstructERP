const GenericService = require('./genericService');

const inventarioService = new GenericService('inventario', {
  idField: 'id',
  idIsNumber: true
});

module.exports = inventarioService;