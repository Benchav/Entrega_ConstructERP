const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/licitacionesController');

/**
 * @swagger
 * tags:
 *   - name: Licitaciones
 *     description: Operaciones sobre licitaciones
 */

/**
 * @swagger
 * /api/licitaciones:
 *   get:
 *     tags:
 *       - Licitaciones
 *     summary: Obtener lista de licitaciones
 *     responses:
 *       "200":
 *         description: Lista de licitaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Licitacion'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/licitaciones:
 *   post:
 *     tags:
 *       - Licitaciones
 *     summary: Crear nueva licitación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LicitacionCreate'
 *     responses:
 *       "201":
 *         description: Licitación creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Licitacion'
 *       "400":
 *         description: Datos de entrada inválidos
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /api/licitaciones/{id}:
 *   put:
 *     tags:
 *       - Licitaciones
 *     summary: Actualizar licitación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LicitacionUpdate'
 *     responses:
 *       "200":
 *         description: Licitación actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Licitacion'
 *       "404":
 *         description: Licitación no encontrada
 */
router.put('/:id', ctrl.update);

/**
 * @swagger
 * /api/licitaciones/{id}:
 *   delete:
 *     tags:
 *       - Licitaciones
 *     summary: Eliminar licitación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Eliminado correctamente
 *       "404":
 *         description: Licitación no encontrada
 */
router.delete('/:id', ctrl.remove);


router.get('/:id', ctrl.getById);

module.exports = router;