const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ordenesCompraController');

/**
 * @swagger
 * tags:
 *   - name: ordenes-compra
 *     description: Operaciones sobre órdenes de compra
 */

/**
 * @swagger
 * /api/ordenes-compra:
 *   get:
 *     tags:
 *       - OrdenesCompra
 *     summary: Obtener lista de órdenes de compra
 *     responses:
 *       "200":
 *         description: Lista de órdenes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrdenCompra'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/ordenes-compra:
 *   post:
 *     tags:
 *       - OrdenesCompra
 *     summary: Crear nueva orden de compra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrdenCompraCreate'
 *     responses:
 *       "201":
 *         description: Orden creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenCompra'
 *       "400":
 *         description: Datos de entrada inválidos
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /api/ordenes-compra/{id}:
 *   put:
 *     tags:
 *       - OrdenesCompra
 *     summary: Actualizar orden de compra
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
 *             $ref: '#/components/schemas/OrdenCompraUpdate'
 *     responses:
 *       "200":
 *         description: Orden actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenCompra'
 *       "404":
 *         description: Orden no encontrada
 */
router.put('/:id', ctrl.update);

/**
 * @swagger
 * /api/ordenes-compra/{id}:
 *   delete:
 *     tags:
 *       - OrdenesCompra
 *     summary: Eliminar orden de compra
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
 *         description: Orden no encontrada
 */
router.delete('/:id', ctrl.remove);

/**
 * @swagger
 * /api/ordenes-compra/{id}:
 *   get:
 *     tags:
 *       - OrdenesCompra
 *     summary: Obtener una orden de compra por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Orden encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenCompra'
 *       "404":
 *         description: Orden no encontrada
 */
router.get('/:id', ctrl.getById);

module.exports = router;