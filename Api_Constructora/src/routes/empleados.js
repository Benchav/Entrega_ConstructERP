const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/empleadosController');

/**
 * @swagger
 * tags:
 *   - name: Empleados
 *     description: Operaciones sobre empleados de obra
 */

/**
 * @swagger
 * /api/empleados:
 *   get:
 *     tags:
 *       - Empleados
 *     summary: Obtener lista de empleados
 *     responses:
 *       "200":
 *         description: Lista de empleados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Empleado'
 */
router.get('/', ctrl.list);

/**
 * @swagger
 * /api/empleados:
 *   post:
 *     tags:
 *       - Empleados
 *     summary: Crear nuevo empleado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpleadoCreate'
 *     responses:
 *       "201":
 *         description: Empleado creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empleado'
 *       "400":
 *         description: Datos de entrada inválidos
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /api/empleados/{id}:
 *   put:
 *     tags:
 *       - Empleados
 *     summary: Actualizar empleado
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
 *             $ref: '#/components/schemas/EmpleadoUpdate'
 *     responses:
 *       "200":
 *         description: Empleado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empleado'
 *       "404":
 *         description: Empleado no encontrado
 */
router.put('/:id', ctrl.update);

/**
 * @swagger
 * /api/empleados/{id}:
 *   delete:
 *     tags:
 *       - Empleados
 *     summary: Eliminar empleado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Empleado no encontrado
 */
router.delete('/:id', ctrl.remove);


router.get('/:id', ctrl.getById);

module.exports = router;