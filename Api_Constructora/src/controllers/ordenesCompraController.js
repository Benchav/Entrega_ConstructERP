const ordenesCompraService = require('../services/ordenesCompraService');
const makeController = require('./genericController');
const { validateCreateOrdenCompra } = require('../models/ordenCompra');

const controller = makeController(ordenesCompraService);


const originalCreate = controller.create;


controller.create = async (req, res) => {
  const validation = validateCreateOrdenCompra(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: 'Faltan campos requeridos', missing: validation.missing });
  }


  if (req.body.estado === undefined) {
    req.body.estado = 'Pendiente'; 
  }


  return await originalCreate(req, res);
};

module.exports = controller;