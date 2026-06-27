const usuariosService = require('../services/usuariosService');
const makeController = require('./genericController');
const { validateCreateUsuario } = require('../models/usuario');


const controller = makeController(usuariosService);


const originalCreate = controller.create;


controller.create = async (req, res) => {
  const validation = validateCreateUsuario(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: 'Faltan campos requeridos', missing: validation.missing });
  }
  

  return await originalCreate(req, res);
};

module.exports = controller;