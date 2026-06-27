const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportesDiariosController');

/**
 * @swagger
 * tags:
 *   - name: ReportesDiarios
 *     description: Operaciones sobre reportes diarios de obra
 */

/**
 * @swagger
 * /api/reportes:
 *   get:
 *     tags:
 *       - ReportesDiarios
 *     summary: Obtener lista de reportes diarios
 *     responses:
 *       "200":
 *         description: Lista de reportes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReporteDiario'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/reportes:
 *   post:
 *     tags:
 *       - ReportesDiarios
 *     summary: Crear nuevo reporte diario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReporteDiarioCreate'
 *     responses:
 *       "201":
 *         description: Reporte creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteDiario'
 *       "400":
 *         description: Datos de entrada inválidos
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /api/reportes/{id}:
 *   put:
 *     tags:
 *       - ReportesDiarios
 *     summary: Actualizar reporte diario
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
 *             $ref: '#/components/schemas/ReporteDiarioUpdate'
 *     responses:
 *       "200":
 *         description: Reporte actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteDiario'
 *       "404":
 *         description: Reporte no encontrado
 */
router.put('/:id', ctrl.update);

/**
 * @swagger
 * /api/reportes/{id}:
 *   delete:
 *     tags:
 *       - ReportesDiarios
 *     summary: Eliminar reporte diario
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
 *         description: Reporte no encontrado
 */
router.delete('/:id', ctrl.remove);

/**
 * @swagger
 * /api/reportes/{id}:
 *   get:
 *     tags:
 *       - ReportesDiarios
 *     summary: Obtener un reporte diario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Reporte encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteDiario'
 *       "404":
 *         description: Reporte no encontrado
 */
router.get('/:id', ctrl.getById);

module.exports = router;