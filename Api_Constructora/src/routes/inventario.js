const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventarioController');

/**
 * @swagger
 * tags:
 *   - name: Inventario
 *     description: Operaciones sobre inventario de obra
 */

/**
 * @swagger
 * /api/inventario:
 *   get:
 *     tags:
 *       - Inventario
 *     summary: Obtener lista de ítems de inventario
 *     responses:
 *       200:
 *         description: Lista de ítems
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventarioItem'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/inventario:
 *   post:
 *     tags:
 *       - Inventario
 *     summary: Crear nuevo ítem de inventario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventarioItemCreate'
 *     responses:
 *       201:
 *         description: Ítem creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventarioItem'
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /api/inventario/{id}:
 *   put:
 *     tags:
 *       - Inventario
 *     summary: Actualizar ítem de inventario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventarioItemUpdate'
 *     responses:
 *       200:
 *         description: Ítem actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventarioItem'
 *       404:
 *         description: Ítem no encontrado
 */
router.put('/:id', ctrl.update);

/**
 * @swagger
 * /api/inventario/{id}:
 *   delete:
 *     tags:
 *       - Inventario
 *     summary: Eliminar ítem de inventario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Eliminado correctamente
 *       404:
 *         description: Ítem no encontrado
 */
router.delete('/:id', ctrl.remove);

/**
 * @swagger
 * /api/inventario/{id}:
 *   get:
 *     tags:
 *       - Inventario
 *     summary: Obtener un ítem de inventario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ítem encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventarioItem'
 *       404:
 *         description: Ítem no encontrado
 */
router.get('/:id', ctrl.getById);

module.exports = router;