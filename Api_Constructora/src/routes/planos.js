const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/planosController');

/**
 * @swagger
 * tags:
 *   - name: Planos
 *     description: Operaciones sobre planos de proyectos
 */

/**
 * @swagger
 * /api/planos:
 *   get:
 *     tags:
 *       - Planos
 *     summary: Obtener lista de planos
 *     responses:
 *       "200":
 *         description: Lista de planos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plano'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/planos:
 *   post:
 *     tags:
 *       - Planos
 *     summary: Crear nuevo plano
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanoCreate'
 *     responses:
 *       "201":
 *         description: Plano creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plano'
 *       "400":
 *         description: Datos de entrada inválidos
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /api/planos/{id}:
 *   put:
 *     tags:
 *       - Planos
 *     summary: Actualizar plano
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
 *             $ref: '#/components/schemas/PlanoUpdate'
 *     responses:
 *       "200":
 *         description: Plano actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plano'
 *       "404":
 *         description: Plano no encontrado
 */
router.put('/:id', ctrl.update);

/**
 * @swagger
 * /api/planos/{id}:
 *   delete:
 *     tags:
 *       - Planos
 *     summary: Eliminar plano
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
 *         description: Plano no encontrado
 */
router.delete('/:id', ctrl.remove);


router.get('/:id', ctrl.getById);

module.exports = router;