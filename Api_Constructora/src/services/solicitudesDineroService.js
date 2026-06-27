const GenericService = require('./genericService');

const solicitudesDineroService = new GenericService('solicitudes-dinero', {
  idField: 'id',
  idIsNumber: false,
  idPrefix: 'SOL-DIN-'
});

module.exports = solicitudesDineroService;