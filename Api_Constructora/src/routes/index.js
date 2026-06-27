const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');


router.use('/auth', require('./auth'));


router.use(protect);



router.use(
  '/usuarios',
  authorizeRoles('CEO', 'Gerente General', 'Director de Proyectos', 'RRHH'),
  require('./usuarios')
);


router.use(
  '/proyectos',
  authorizeRoles(
    'CEO',
    'Gerente General',
    'Director de Proyectos',
    'Director Finanzas',
    'Director Comercial',
    'Jefe Oficina Tecnica',
    'Jefe de Logística',
    'Jefe de Obra',
    'Maestro de Obra',
    'RRHH',
    'Bodeguero',
    'Asistente Administrativo',
    'Albañil',
    'Operador de Maquinaria'
  ),
  require('./proyectos')
);


router.use(
  '/inventario',
  authorizeRoles('CEO', 'Gerente General', 'Director de Proyectos', 'Jefe de Logística', 'Jefe de Obra', 'Bodeguero'),
  require('./inventario')
);


router.use(
  '/empleados',
  authorizeRoles('CEO', 'Gerente General', 'Director de Proyectos', 'Director Comercial', 'RRHH', 'Asistente Administrativo'),
  require('./empleados')
);


router.use(
  '/finanzas',
  authorizeRoles('CEO', 'Director Finanzas', 'Gerente General', 'Director Comercial', 'Director de Proyectos', 'Asistente Administrativo'),
  require('./finanzas')
);


router.use(
  '/licitaciones',
  authorizeRoles('CEO', 'Gerente General', 'Director Comercial'),
  require('./licitaciones')
);

router.use(
  '/planos',
  authorizeRoles(
    'CEO',
    'Gerente General',
    'Director de Proyectos',
    'Jefe Oficina Tecnica',
    'Jefe de Obra',
    'Maestro de Obra',
    'Albañil',
    'Operador de Maquinaria'
  ),
  require('./planos')
);


router.use(
  '/reportes',
  authorizeRoles('CEO', 'Gerente General', 'Director de Proyectos', 'Jefe de Obra', 'Maestro de Obra'),
  require('./reportesDiarios')
);


router.use(
  '/solicitudesMateriales',
  authorizeRoles('CEO', 'Gerente General', 'Director de Proyectos', 'Director Comercial', 'Jefe Oficina Tecnica', 'Director Finanzas', 'Jefe de Obra', 'Jefe de Logística', 'Bodeguero'),
  require('./solicitudesMateriales')
);


router.use(
  '/solicitudesDinero',
  authorizeRoles('CEO', 'Gerente General', 'Director de Proyectos', 'Director Comercial', 'Director Finanzas', 'Gerente General', 'Jefe de Obra', 'Asistente Administrativo'),
  require('./solicitudesDinero')
);


router.use(
  '/ordenescompra',
  authorizeRoles('CEO', 'Director Finanzas', 'Gerente General', 'Jefe de Logística'),
  require('./ordenesCompra')
);


router.use(
  '/inspeccionesCalidad',
  authorizeRoles('CEO', 'Director de Proyectos', 'Gerente General','Jefe Oficina Tecnica', 'Jefe de Obra'),
  require('./inspeccionesCalidad')
);


router.use(
  '/incidentesSeguridad',
  authorizeRoles('CEO', 'Gerente General', 'Director de Proyectos', 'RRHH', 'Maestro de Obra', 'Jefe de Obra'),
  require('./incidentesSeguridad')
);

module.exports = router;