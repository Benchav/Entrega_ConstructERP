const inventarioService = require('../services/inventarioService');
const makeController = require('./genericController');
const { validateCreateInventarioItem } = require('../models/inventario');

const controller = makeController(inventarioService);


const originalCreate = controller.create;


controller.create = async (req, res) => {
  const validation = validateCreateInventarioItem(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: 'Faltan campos requeridos', missing: validation.missing });
  }
  

  return await originalCreate(req, res);
};

module.exports = controller;