const GenericService = require('./genericService');

const inspeccionesCalidadService = new GenericService('inspecciones', {
  idField: 'id',
  idIsNumber: false,
  idPrefix: 'INSP-'
});

module.exports = inspeccionesCalidadService;