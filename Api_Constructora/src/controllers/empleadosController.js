const empleadosService = require('../services/empleadosService');
const makeController = require('./genericController');
const { validateCreateEmpleado } = require('../models/empleado');

const controller = makeController(empleadosService);

const originalCreate = controller.create;


controller.create = async (req, res) => {
  const validation = validateCreateEmpleado(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: 'Faltan campos requeridos', missing: validation.missing });
  }
  

  if (req.body.proyectoAsignadoId === undefined) {
    req.body.proyectoAsignadoId = null; 
  }


  return await originalCreate(req, res);
};

module.exports = controller;