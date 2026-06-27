const admin = require('firebase-admin');

const requiredEnv = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(
    `Variables de entorno de Firebase faltantes: ${missingEnv.join(', ')}. ` +
    `Asegúrate de que tu archivo .env esté completo.`
  );
}

let privateKey = process.env.FIREBASE_PRIVATE_KEY;
privateKey = privateKey.replace(/\\n/g, '\n').replace(/"/g, ''); 

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: privateKey,
};

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  console.log('✅ Conectado a Firebase exitosamente.');
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin:', error);
  console.error('Verifica las variables FIREBASE_ en tu .env.');
  process.exit(1);
}

const db = admin.firestore();
module.exports = { db, admin };
