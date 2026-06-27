const GenericService = require('./genericService');

const planosService = new GenericService('planos', {
  idField: 'id',
  idIsNumber: false,
  idPrefix: 'PLN-'
});

module.exports = planosService;