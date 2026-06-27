const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/solicitudesDineroController');

/**
 * @swagger
 * tags:
 *   - name: SolicitudesDinero
 *     description: Operaciones sobre solicitudes de dinero
 */

/**
 * @swagger
 * /api/solicitudesDinero:
 *   get:
 *     tags:
 *       - SolicitudesDinero
 *     summary: Obtener lista de solicitudes de dinero
 *     responses:
 *       "200":
 *         description: Lista de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SolicitudDinero'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/solicitudesDinero:
 *   post:
 *     tags:
 *       - SolicitudesDinero
 *     summary: Crear nueva solicitud de dinero
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SolicitudDineroCreate'
 *     responses:
 *       "201":
 *         description: Solicitud creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolicitudDinero'
 *       "400":
 *         description: Datos de entrada inválidos
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /api/solicitudesDinero/{id}:
 *   put:
 *     tags:
 *       - SolicitudesDinero
 *     summary: Actualizar solicitud de dinero
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
 *             $ref: '#/components/schemas/SolicitudDineroUpdate'
 *     responses:
 *       "200":
 *         description: Solicitud actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolicitudDinero'
 *       "404":
 *         description: Solicitud no encontrada
 */
router.put('/:id', ctrl.update);

/**
 * @swagger
 * /api/solicitudesDinero/{id}:
 *   delete:
 *     tags:
 *       - SolicitudesDinero
 *     summary: Eliminar solicitud de dinero
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
 * /api/solicitudesDinero/{id}:
 *   get:
 *     tags:
 *       - SolicitudesDinero
 *     summary: Obtener una solicitud de dinero por ID
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
 *               $ref: '#/components/schemas/SolicitudDinero'
 *       "404":
 *         description: Solicitud no encontrada
 */
router.get('/:id', ctrl.getById);

module.exports = router;