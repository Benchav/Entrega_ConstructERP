const GenericService = require('./genericService');
const { db } = require('../config/firebase'); 
const bcrypt = require('bcrypt');

const collectionName = 'usuarios';

class UsuariosService extends GenericService {
  constructor() {
 
    super(collectionName, {
      idField: 'id',
      idIsNumber: true
    });
  }


  async create(data) {
    try {
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      
    
      const userData = {
        ...data,
        password: hashedPassword
      };

  
      const newItem = await super.create(userData);


      const { password, ...userWithoutPass } = newItem;
      return userWithoutPass;

    } catch (error) {
      console.error("Error al hashear password o crear usuario:", error);
      throw error;
    }
  }


  async findUserByUsername(username) {
  
    return await this.findByField('username', username, true);
  }

  async update(id, data) {
 
    if (data.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
      } catch (error) {
        console.error("Error al hashear password en actualización:", error);
        throw error;
      }
    }

    const updatedItem = await super.update(id, data);
    if (!updatedItem) return null;
    

    const { password, ...userWithoutPass } = updatedItem;
    return userWithoutPass;
  }


  async findById(id) {
    const item = await super.findById(id);
    if (!item) return null;
    const { password, ...itemWithoutPass } = item;
    return itemWithoutPass;
  }

  async findAll() {
    const items = await super.findAll();
    return items.map(item => {
      const { password, ...itemWithoutPass } = item;
      return itemWithoutPass;
    });
  }
}


module.exports = new UsuariosService();