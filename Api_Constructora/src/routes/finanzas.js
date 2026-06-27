const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/finanzasController');

/**
 * @swagger
 * tags:
 *   - name: Finanzas
 *     description: Operaciones sobre registros financieros
 */

/**
 * @swagger
 * /api/finanzas:
 *   get:
 *     tags:
 *       - Finanzas
 *     summary: Obtener lista de registros financieros
 *     responses:
 *       "200":
 *         description: Lista de registros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Finanza'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/finanzas:
 *   post:
 *     tags:
 *       - Finanzas
 *     summary: Crear nuevo registro financiero
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinanzaCreate'
 *     responses:
 *       "201":
 *         description: Registro creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Finanza'
 *       "400":
 *         description: Datos de entrada inválidos
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /api/finanzas/{id}:
 *   put:
 *     tags:
 *       - Finanzas
 *     summary: Actualizar registro financiero
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
 *             $ref: '#/components/schemas/FinanzaUpdate'
 *     responses:
 *       "200":
 *         description: Registro actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Finanza'
 *       "404":
 *         description: Registro no encontrado
 */
router.put('/:id', ctrl.update);

/**
 * @swagger
 * /api/finanzas/{id}:
 *   delete:
 *     tags:
 *       - Finanzas
 *     summary: Eliminar registro financiero
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
 *         description: Registro no encontrado
 */
router.delete('/:id', ctrl.remove);


router.get('/:id', ctrl.getById);

module.exports = router;