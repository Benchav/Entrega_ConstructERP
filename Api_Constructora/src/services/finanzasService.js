const GenericService = require('./genericService');

const finanzasService = new GenericService('finanzas', {
  idField: 'id',
  idIsNumber: false,
  idPrefix: 'FIN-'
});

module.exports = finanzasService;