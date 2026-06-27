const incidentesSeguridadService = require('../services/incidentesSeguridadService');
const makeController = require('./genericController');
const { validateCreateIncidenteSeguridad } = require('../models/incidenteSeguridad');

const controller = makeController(incidentesSeguridadService);


const originalCreate = controller.create;


controller.create = async (req, res) => {
  const validation = validateCreateIncidenteSeguridad(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: 'Faltan campos requeridos', missing: validation.missing });
  }

  return await originalCreate(req, res);
};

module.exports = controller;