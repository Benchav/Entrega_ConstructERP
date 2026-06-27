const proyectosService = require('../services/proyectosService');
const makeController = require('./genericController');
const { validateCreateProyecto } = require('../models/proyecto');


const controller = makeController(proyectosService);


const originalCreate = controller.create;


controller.create = async (req, res) => {
  const validation = validateCreateProyecto(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: 'Faltan campos requeridos', missing: validation.missing });
  }


  if (req.body.avance === undefined) {
    req.body.avance = 0; 
  }


  return await originalCreate(req, res);
};

module.exports = controller;