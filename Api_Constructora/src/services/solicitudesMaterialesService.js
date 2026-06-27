const GenericService = require('./genericService');

const solicitudesMaterialesService = new GenericService('solicitudes-material', {
  idField: 'id',
  idIsNumber: false,
  idPrefix: 'SOL-MAT-'
});

module.exports = solicitudesMaterialesService;