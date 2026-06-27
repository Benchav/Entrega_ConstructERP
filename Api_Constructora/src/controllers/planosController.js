const planosService = require('../services/planosService');
const makeController = require('./genericController');
const { validateCreatePlano } = require('../models/plano');

const controller = makeController(planosService);


const originalCreate = controller.create;


controller.create = async (req, res) => {
  const validation = validateCreatePlano(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: 'Faltan campos requeridos', missing: validation.missing });
  }

  return await originalCreate(req, res);
};

module.exports = controller;