const GenericService = require('./genericService');

const reportesDiariosService = new GenericService('reportes', {
  idField: 'id',
  idIsNumber: false,
  idPrefix: 'REP-'
});

module.exports = reportesDiariosService;