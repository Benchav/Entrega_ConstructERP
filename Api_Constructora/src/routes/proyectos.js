const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/proyectosController');
const validateZod = require('../middleware/validateZod');
const { proyectoSchema } = require('../validations/proyectoSchema');

/**
 * @swagger
 * tags:
 *   - name: Proyectos
 *     description: Operaciones sobre proyectos
 */

/**
 * @swagger
 * /api/proyectos:
 *   get:
 *     tags:
 *       - Proyectos
 *     summary: Obtener lista de proyectos
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proyecto'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/proyectos:
 *   post:
 *     tags:
 *       - Proyectos
 *     summary: Crear nuevo proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProyectoCreate'
 *     responses:
 *       201:
 *         description: Proyecto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proyecto'
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', validateZod(proyectoSchema), ctrl.create);

/**
 * @swagger
 * /api/proyectos/{id}:
 *   put:
 *     tags:
 *       - Proyectos
 *     summary: Actualizar proyecto (parcial)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérico del proyecto.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProyectoUpdate'
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proyecto'
 *       404:
 *         description: Proyecto no encontrado
 */
router.put('/:id', validateZod(proyectoSchema), ctrl.update);

/**
 * @swagger
 * /api/proyectos/{id}:
 *   delete:
 *     tags:
 *       - Proyectos
 *     summary: Eliminar proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérico del proyecto.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proyecto eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Eliminado correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete('/:id', ctrl.remove);

/**
 * @swagger
 * /api/proyectos/{id}:
 *   get:
 *     tags:
 *       - Proyectos
 *     summary: Obtener un proyecto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proyecto'
 *       404:
 *         description: Proyecto no encontrado
 */
router.get('/:id', ctrl.getById);

module.exports = router;