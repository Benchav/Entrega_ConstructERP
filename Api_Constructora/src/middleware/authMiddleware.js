const jwt = require('jsonwebtoken');
const usuariosService = require('../services/usuariosService');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET no está definido en el archivo .env");
  process.exit(1);
}
const SECRET = process.env.JWT_SECRET;

const permisos = {
  CEO: ['*'],
  'Gerente General': ['proyectos', 'reportes', 'finanzas', 'licitaciones', 'inventario'],
  'Director de Proyectos': ['proyectos', 'reportes', 'planos', 'materiales', 'inspeccionesCalidad', 'solicitudesMateriales'],
  'Director Finanzas': ['finanzas', 'reportes', 'solicitudesDinero', 'ordenescompra', 'proyectos'],
  'Director Comercial': ['licitaciones', 'reportes', 'proyectos'],
  'Jefe Oficina Tecnica': ['planos', 'proyectos', 'reportes', 'inspeccionesCalidad'],
  'Jefe de Logística': ['inventario', 'ordenescompra', 'solicitudesMateriales', 'proyectos'],
  RRHH: ['personal', 'incidentesSeguridad', 'reportes'],
  'Asistente Administrativo': ['finanzas', 'reportes', 'proyectos'],
  'Jefe de Obra': ['proyectos', 'planos', 'reportes', 'materiales', 'calidad', 'solicitudesMateriales', 'solicitudesDinero', 'incidentesSeguridad', 'inventario'],
  'Maestro de Obra': ['proyectos', 'planos', 'reportes'],
  Bodeguero: ['inventario', 'solicitudesMateriales', 'proyectos'],
  Albañil: ['proyectos', 'planos'],
  'Operador de Maquinaria': ['proyectos', 'planos']
};



function extractTokenFromReq(req) {
  // Primero intentar extraer de la cookie HttpOnly
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  // Soporte legado/fallback para cabecera Authorization: Bearer
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  return null; // Rechazar explícitamente query strings y headers inseguros
}


function normalizeRol(rol) {
  return rol
    ? rol
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
    : '';
}


async function protect(req, res, next) {
  const token = extractTokenFromReq(req);

  if (!token) {
    return res
      .status(401)
      .json({ message: 'No autenticado. Proporcione Authorization: Bearer <token>' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await usuariosService.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });

    const userRolNorm = normalizeRol(req.user.rol);
    const allowedNorms = (allowedRoles || []).map(normalizeRol);

    const rolKey = Object.keys(permisos).find(
      (r) => normalizeRol(r) === userRolNorm
    );

    if (!rolKey) {
      return res
        .status(403)
        .json({ message: `Rol '${req.user.rol}' no reconocido` });
    }

    if (rolKey.toLowerCase() === 'ceo') return next();

   
    if (allowedRoles && allowedRoles.length > 0 && allowedNorms.includes(userRolNorm)) {
      return next();
    }


    const parts = (req.originalUrl || req.baseUrl || '').split('/').filter(Boolean);

    const modulo = parts[1] || parts[0] || '';

    const mapPermisos = {
      ordenescompra: 'compras',
      solicitudesmateriales: 'materiales',
      solicitudesdinero: 'finanzas',
      empleados: 'personal',
      reportesdiarios: 'reportes',
      inspeccionescalidad: 'calidad',
      incidentesseguridad: 'seguridad'
    };

    const moduloNorm = modulo.toLowerCase();
    const moduloPermiso = mapPermisos[moduloNorm] || moduloNorm;

    const puedeAcceder =
      permisos[rolKey]?.includes('*') ||
      permisos[rolKey]?.some(m => String(m).toLowerCase() === moduloPermiso);

    if (puedeAcceder) return next();

    return res.status(403).json({
      message: `Acceso denegado. Rol '${req.user.rol}' no autorizado para el módulo '${moduloPermiso}'.`,
    });
  };
}



function authorize(moduleOrRoles) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: 'No autenticado' });
    if (!moduleOrRoles)
      return res.status(403).json({ message: 'Sin permisos configurados' });

    if (Array.isArray(moduleOrRoles)) {
      return moduleOrRoles.includes(req.user.rol)
        ? next()
        : res.status(403).json({ message: 'Acceso denegado' });
    }

    if (String(moduleOrRoles) === req.user.rol) return next();

    return res.status(403).json({ message: 'Acceso denegado' });
  };
}

module.exports = { protect, authorizeRoles, authorize, permisos };