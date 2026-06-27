const inspeccionesCalidadService = require('../services/inspeccionesCalidadService');
const makeController = require('./genericController');
const { validateCreateInspeccionCalidad } = require('../models/inspeccionCalidad');

const controller = makeController(inspeccionesCalidadService);


const originalCreate = controller.create;


controller.create = async (req, res) => {
  const validation = validateCreateInspeccionCalidad(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: 'Faltan campos requeridos', missing: validation.missing });
  }

  return await originalCreate(req, res);
};

module.exports = controller;