import sql from 'mssql';
import { DB } from '../config.js';

let poolPromise = null;

export const getConnection = async () => {
  try {
    if (!poolPromise) {
      console.log('Configuración DB:', DB); 
      poolPromise = sql.connect(DB);
    }
    return await poolPromise;
  } catch (error) {
    console.error('Error de conexión a la BD:', error);
    throw error;
  }
};

(async () => {
  try {
    const pool = await getConnection();
    console.log('✅ Conectado correctamente a la BD:', pool.connected);
  } catch (error) {
    console.error('❌ Falló la conexión a la BD:', error);
  }
})();

