const GenericService = require('./genericService');

const licitacionesService = new GenericService('licitaciones', {
  idField: 'id',
  idIsNumber: false,
  idPrefix: 'LIC-'
});

module.exports = licitacionesService;