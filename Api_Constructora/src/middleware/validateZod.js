const { ZodError } = require('zod');

/**
 * Middleware genérico para validar peticiones usando esquemas de Zod.
 * @param {import('zod').ZodSchema} schema Esquema Zod a validar contra req.body
 */
const validateZod = (schema) => {
  return (req, res, next) => {
    try {
      // parse() arroja un error si la validación falla
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Error de validación en los datos de entrada',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(500).json({ message: 'Error interno en la validación' });
    }
  };
};

module.exports = validateZod;
