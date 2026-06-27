const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/solicitudesMaterialesController');

/**
 * @swagger
 * tags:
 *   - name: solicitudesMateriales
 *     description: Operaciones sobre solicitudes de materiales
 */

/**
 * @swagger
 * /api/solicitudesMateriales:
 *   get:
 *     tags:
 *       - solicitudesMateriales
 *     summary: Obtener lista de solicitudes de materiales
 *     responses:
 *       "200":
 *         description: Lista de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SolicitudMaterial'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/solicitudesMateriales:
 *   post:
 *     tags:
 *       - solicitudesMateriales
 *     summary: Crear nueva solicitud de material
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SolicitudMaterialCreate'
 *     responses:
 *       "201":
 *         description: Solicitud creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolicitudMaterial'
 *       "400":
 *         description: Datos de entrada inválidos
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /api/solicitudesMateriales/{id}:
 *   put:
 *     tags:
 *       - solicitudesMateriales
 *     summary: Actualizar solicitud de material
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
 *             $ref: '#/components/schemas/SolicitudMaterialUpdate'
 *     responses:
 *       "200":
 *         description: Solicitud actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolicitudMaterial'
 *       "404":
 *         description: Solicitud no encontrada
 */
router.put('/:id', ctrl.update);

/**
 * @swagger
 * /api/solicitudesMateriales/{id}:
 *   delete:
 *     tags:
 *       - solicitudesMateriales
 *     summary: Eliminar solicitud de material
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
 *         description: Solicitud no encontrada
 */
router.delete('/:id', ctrl.remove);

/**
 * @swagger
 * /api/solicitudesMateriales/{id}:
 *   get:
 *     tags:
 *       - solicitudesMateriales
 *     summary: Obtener una solicitud de material por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Solicitud encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolicitudMaterial'
 *       "404":
 *         description: Solicitud no encontrada
 */
router.get('/:id', ctrl.getById);

module.exports = router;