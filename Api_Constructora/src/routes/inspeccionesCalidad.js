const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inspeccionesCalidadController');

/**
 * @swagger
 * tags:
 *   - name: inspeccionesCalidad
 *     description: Operaciones sobre inspecciones de calidad
 */

/**
 * @swagger
 * /api/inspeccionesCalidad:
 *   get:
 *     tags:
 *       - inspeccionesCalidad
 *     summary: Obtener lista de inspecciones
 *     responses:
 *       "200":
 *         description: Lista de inspecciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InspeccionCalidad'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/inspeccionesCalidad:
 *   post:
 *     tags:
 *       - inspeccionesCalidad
 *     summary: Crear nueva inspección
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InspeccionCalidadCreate'
 *     responses:
 *       "201":
 *         description: Inspección creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InspeccionCalidad'
 *       "400":
 *         description: Datos de entrada inválidos
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /api/inspeccionesCalidad/{id}:
 *   put:
 *     tags:
 *       - inspeccionesCalidad
 *     summary: Actualizar inspección
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
 *             $ref: '#/components/schemas/InspeccionCalidadUpdate'
 *     responses:
 *       "200":
 *         description: Inspección actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InspeccionCalidad'
 *       "404":
 *         description: Inspección no encontrada
 */
router.put('/:id', ctrl.update);

/**
 * @swagger
 * /api/inspeccionesCalidad/{id}:
 *   delete:
 *     tags:
 *       - inspeccionesCalidad
 *     summary: Eliminar inspección
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
 *         description: Inspección no encontrada
 */
router.delete('/:id', ctrl.remove);

/**
 * @swagger
 * /api/inspeccionesCalidad/{id}:
 *   get:
 *     tags:
 *       - inspeccionesCalidad
 *     summary: Obtener una inspección por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Inspección encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InspeccionCalidad'
 *       "404":
 *         description: Inspección no encontrada
 */
router.get('/:id', ctrl.getById);

module.exports = router;