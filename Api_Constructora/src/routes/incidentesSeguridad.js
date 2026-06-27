const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/incidentesSeguridadController');

/**
 * @swagger
 * tags:
 *   - name: incidentesSeguridad
 *     description: Operaciones sobre incidentes de seguridad
 */

/**
 * @swagger
 * /api/incidentesSeguridad:
 *   get:
 *     tags:
 *       - incidentesSeguridad
 *     summary: Obtener lista de incidentes
 *     responses:
 *       "200":
 *         description: Lista de incidentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/IncidenteSeguridad'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/incidentesSeguridad:
 *   post:
 *     tags:
 *       - incidentesSeguridad
 *     summary: Crear nuevo incidente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IncidenteSeguridadCreate'
 *     responses:
 *       "201":
 *         description: Incidente creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IncidenteSeguridad'
 *       "400":
 *         description: Datos de entrada inválidos
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /api/incidentesSeguridad/{id}:
 *   put:
 *     tags:
 *       - incidentesSeguridad
 *     summary: Actualizar incidente
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
 *             $ref: '#/components/schemas/IncidenteSeguridadUpdate'
 *     responses:
 *       "200":
 *         description: Incidente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IncidenteSeguridad'
 *       "404":
 *         description: Incidente no encontrado
 */
router.put('/:id', ctrl.update);

/**
 * @swagger
 * /api/incidentesSeguridad/{id}:
 *   delete:
 *     tags:
 *       - incidentesSeguridad
 *     summary: Eliminar incidente
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
 *         description: Incidente no encontrado
 */
router.delete('/:id', ctrl.remove);

/**
 * @swagger
 * /api/incidentesSeguridad/{id}:
 *   get:
 *     tags:
 *       - incidentesSeguridad
 *     summary: Obtener un incidente por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Incidente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IncidenteSeguridad'
 *       "404":
 *         description: Incidente no encontrado
 */
router.get('/:id', ctrl.getById);

module.exports = router;