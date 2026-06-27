const express = require('express');
const router = express.Router();
const { login, me, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // limite cada IP a 10 requests por windowMs
  message: { message: "Demasiados intentos de inicio de sesión desde esta IP, por favor intente nuevamente después de 15 minutos" }
});


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login (recibe username y password)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       "200":
 *         description: Devuelve token y usuario
 */
router.post('/login', loginLimiter, login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Información del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Usuario actual
 */
router.get('/me', protect, me);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Cierra la sesión (elimina la cookie)
 *     responses:
 *       "200":
 *         description: Sesión cerrada
 */
router.post('/logout', logout);

module.exports = router;