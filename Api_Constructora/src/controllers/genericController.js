
function makeController(service) {
  return {
    
 
    list: async (req, res) => {
      try {
    
        const items = await service.findAll();
        res.json(items);
      } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Error al obtener la lista de elementos' });
      }
    },

    getById: async (req, res) => {
      try {
        const item = await service.findById(req.params.id);
        if (!item) {

          return res.status(404).json({ message: 'Elemento no encontrado' });
        }
        res.json(item);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el elemento' });
      }
    },

    create: async (req, res) => {
      try {
        const newItem = await service.create(req.body, req.user);
        res.status(201).json(newItem);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el elemento' });
      }
    },

    update: async (req, res) => {
      try {
        const updatedItem = await service.update(req.params.id, req.body, req.user);
        if (!updatedItem) {
          return res.status(404).json({ message: 'Elemento no encontrado' });
        }
        res.json(updatedItem);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el elemento' });
      }
    },

    remove: async (req, res) => {
      try {
        const deleted = await service.remove(req.params.id, req.user);
        if (!deleted) {
          return res.status(404).json({ message: 'Elemento no encontrado' });
        }
        res.json({ message: 'Eliminado correctamente' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el elemento' });
      }
    }
  };
}

module.exports = makeController;