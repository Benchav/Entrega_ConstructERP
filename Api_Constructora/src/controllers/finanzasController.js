// src/controllers/finanzasController.js
const finanzasService = require('../services/finanzasService');
const makeController = require('./genericController');
const { validateCreateFinanza } = require('../models/finanza');

const controller = makeController(finanzasService);


const originalCreate = controller.create;


controller.create = async (req, res) => {
  const validation = validateCreateFinanza(req.body);
  if (!validation.ok) {
    return res.status(400).json({ message: 'Faltan campos requeridos', missing: validation.missing });
  }

  return await originalCreate(req, res);
};

module.exports = controller;