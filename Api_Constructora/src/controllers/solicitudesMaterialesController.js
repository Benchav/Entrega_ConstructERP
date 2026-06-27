const solicitudesMaterialesService = require('../services/solicitudesMaterialesService');
const makeController = require('./genericController');
const { validateCreateSolicitudMaterial } = require('../models/solicitudMaterial');

const controller = makeController(solicitudesMaterialesService);


const originalCreate = controller.create;

controller.create = async (req, res) => {
  const validation = validateCreateSolicitudMaterial(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: 'Faltan campos requeridos', missing: validation.missing });
  }

 
  if (req.body.estado === undefined) {
    req.body.estado = 'Pendiente';
  }


  return await originalCreate(req, res);
};

module.exports = controller;