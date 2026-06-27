const { z } = require('zod');

// Schema estricto para la creación/actualización de un proyecto
const proyectoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  presupuesto: z.number().positive('El presupuesto debe ser positivo').optional(),
  avance: z.number().min(0).max(100).optional().default(0),
  estado: z.enum(['Activo', 'Pausado', 'Finalizado', 'En Planificacion']).optional().default('En Planificacion'),
  // Rechazar implícitamente cualquier campo extra que intente enviar el cliente usando .strict()
}).strict();

module.exports = { proyectoSchema };
