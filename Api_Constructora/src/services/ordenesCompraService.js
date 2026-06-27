const GenericService = require('./genericService');

const ordenesCompraService = new GenericService('ordenes-compra', {
  idField: 'id',
  idIsNumber: false,
  idPrefix: 'OC-'
});

module.exports = ordenesCompraService;