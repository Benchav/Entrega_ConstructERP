const GenericService = require('./genericService');

const incidentesSeguridadService = new GenericService('incidentes', {
  idField: 'id',
  idIsNumber: false,
  idPrefix: 'INC-'
});

module.exports = incidentesSeguridadService;