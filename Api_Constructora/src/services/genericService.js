const { db } = require('../config/firebase');
const { generateStringId } = require('../utils/idGenerator');


const countersRef = db.collection('counters');

/**
 * 
 * 
 * @param {string} collectionName 
 */
const generateNumericId = async (collectionName) => {
  const counterDoc = countersRef.doc(collectionName);

  return db.runTransaction(async (transaction) => {
    const doc = await transaction.get(counterDoc);
    let newId = 1; 
    
    if (doc.exists) {

      newId = doc.data().currentId + 1;
    }
    

    transaction.set(counterDoc, { currentId: newId });
    
    return newId;
  });
};


class GenericService {
  /**
   * @param {string} collectionName 
   * @param {object} options 
   */
  constructor(collectionName, { idField = 'id', idIsNumber = false, idPrefix = '' } = {}) {
    if (!collectionName) {
      throw new Error('Se requiere un nombre de colección de Firestore.');
    }
    this.collection = db.collection(collectionName);
    this.collectionName = collectionName; 
    this.idField = idField;
    this.idIsNumber = idIsNumber;
    this.idPrefix = idPrefix;
  }

  
  async findAll() {
    try {
      const snapshot = await this.collection.get();
      if (snapshot.empty) {
        return [];
      }
    
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error(`Error al buscar todo en ${this.collectionName}:`, error);
      throw error; 
    }
  }

 
  async findById(id) {
    try {
      
      const docRef = this.collection.doc(String(id));
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      return doc.data(); 
    } catch (error) {
      console.error(`Error al buscar por ID ${id} en ${this.collectionName}:`, error);
      throw error;
    }
  }

 
  async create(data, auditUser = null) {
    try {
      // Prevención de Mass Assignment
      const sanitizedData = { ...data };
      delete sanitizedData.rol;
      delete sanitizedData.permisos;
      delete sanitizedData.isAdmin;
      delete sanitizedData.token;

      let newId;

    
      if (this.idIsNumber) {
        newId = await generateNumericId(this.collectionName);
      } else {
        newId = generateStringId(this.idPrefix);
      }

      const newItem = {
        ...sanitizedData,
        [this.idField]: newId,
        createdAt: new Date().toISOString(),
        createdBy: auditUser ? auditUser.username : 'system'
      };

    
      await this.collection.doc(String(newId)).set(newItem);
      
      // Registrar log de auditoría
      if (auditUser) {
        await db.collection('audit_logs').add({
          action: 'CREATE',
          collection: this.collectionName,
          docId: newId,
          user: auditUser.username,
          timestamp: new Date().toISOString()
        });
      }

      return newItem; 
    } catch (error) {
      console.error(`Error al crear en ${this.collectionName}:`, error);
      throw error;
    }
  }

  
  async update(id, data, auditUser = null) {
    try {
      // Prevención de Mass Assignment
      const sanitizedData = { ...data };
      delete sanitizedData.rol;
      delete sanitizedData.permisos;
      delete sanitizedData.isAdmin;
      delete sanitizedData.token;
      delete sanitizedData[this.idField]; // Evitar sobreescribir el ID
      
      sanitizedData.updatedAt = new Date().toISOString();
      if (auditUser) sanitizedData.updatedBy = auditUser.username;

      const docRef = this.collection.doc(String(id));
      
    
      const doc = await docRef.get();
      if (!doc.exists) {
        return null; 
      }

 
      await docRef.set(sanitizedData, { merge: true });

     
      const updatedDoc = await docRef.get();

      // Registrar log de auditoría
      if (auditUser) {
        await db.collection('audit_logs').add({
          action: 'UPDATE',
          collection: this.collectionName,
          docId: id,
          user: auditUser.username,
          timestamp: new Date().toISOString()
        });
      }

      return updatedDoc.data();
    } catch (error) {
      console.error(`Error al actualizar ID ${id} en ${this.collectionName}:`, error);
      throw error;
    }
  }

 
  async remove(id, auditUser = null) {
    try {
      const docRef = this.collection.doc(String(id));
      
      const doc = await docRef.get();
      if (!doc.exists) {
        return null; 
      }

      await docRef.delete();

      // Registrar log de auditoría
      if (auditUser) {
        await db.collection('audit_logs').add({
          action: 'DELETE',
          collection: this.collectionName,
          docId: id,
          user: auditUser.username,
          timestamp: new Date().toISOString()
        });
      }

      return { id }; 
    } catch (error) {
      console.error(`Error al eliminar ID ${id} en ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * 
   * @param {string} field 
   * @param {string} value 
   * @param {boolean} single 
   */
  async findByField(field, value, single = false) {
    try {
      let query = this.collection.where(field, '==', value);
      if (single) {
        query = query.limit(1);
      }
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return single ? null : [];
      }
      
      const results = snapshot.docs.map(doc => doc.data());
      return single ? results[0] : results;

    } catch (error) {
      console.error(`Error al buscar por campo ${field} en ${this.collectionName}:`, error);
      throw error;
    }
  }
}

module.exports = GenericService;