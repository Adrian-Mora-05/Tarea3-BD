import fs from 'fs';
import sql from 'mssql';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';


// RUTA ABSOLUTA del .env en la raíz
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Cargar variables de entorno
dotenv.config
({
  path: resolve(__dirname, '../.env'), // apuntamos manualmente a la raíz
});

export const PORT = process.env.PORT || 3000;


export const DB = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  },
};

console.log("Configuración DB:", DB);
