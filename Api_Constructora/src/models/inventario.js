const { toOpenApiSchema } = require('./_schemaHelper');


const InventarioItem = {
  id: { type: 'integer', example: 50 },
  item: { type: 'string', example: 'Cemento Portland' },
  unidad: { type: 'string', example: 'sacos' },
  stock: { type: 'integer', example: 100 },
  proyectoId: { type: 'integer', example: 100 }
};


const InventarioItemSchema = toOpenApiSchema(InventarioItem, {
  description: 'Item de Inventario completo'
});

const InventarioItemCreate = toOpenApiSchema(InventarioItem, {
  required: ['item', 'unidad', 'stock', 'proyectoId'],
  description: 'Payload para crear item de inventario'
});

const InventarioItemUpdate = toOpenApiSchema(InventarioItem, {
  description: 'Payload para actualizar item de inventario'
});


function validateCreateInventarioItem(payload) {
  const required = ['item', 'unidad', 'stock', 'proyectoId'];
  const missing = required.filter(k => !payload[k]);
  return { ok: missing.length === 0, missing };
}

module.exports = {
  InventarioItemSchema,
  InventarioItemCreate,
  InventarioItemUpdate,
  validateCreateInventarioItem
};