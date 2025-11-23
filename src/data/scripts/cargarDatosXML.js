import fs from 'fs';
import sql from 'mssql';
import * as dotenv from 'dotenv';

dotenv.config(); // Carga variables de entorno

// Configuración de conexión a la base de datos
const config = {
  server: process.env.DB_SERVER, // Servidor de la BD
  port: parseInt(process.env.DB_PORT), // Puerto
  database: process.env.DB_DATABASE, // Nombre BD
  user: process.env.DB_USER,        // Usuario
  password: process.env.DB_PASSWORD,// Contraseña
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',        // Encriptar si aplica
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',// Aceptar certificado
  },
};

// ------------------------------
//  FUNCIÓN GENÉRICA
// ------------------------------
async function enviarXML(xmlPath, nombreSP) {
  try {
    // Lee el archivo XML desde la ruta
    let xmlContent = fs.readFileSync(xmlPath, 'utf-8');

    // Elimina la cabecera XML si existe
    xmlContent = xmlContent.replace(/<\?xml[^>]*\?>/, '');

    const pool = await sql.connect(config); // Abre conexión

    // Ejecuta el stored procedure
    const resultado = await pool.request()
      .input('inArchivoXML', sql.NVarChar(sql.MAX), xmlContent) // Parámetro de entrada
      .output('outResultCode', sql.Int)                         // Código de salida
      .execute(nombreSP);                                       // SP a ejecutar


    console.log(`✔ Resultado del SP (${nombreSP}):`, resultado.output);

    await sql.close(); // Cierra la conexión
  } catch (err) {
    console.error(`Error al enviar el XML con ${nombreSP}:`, err); // Muestra error
  }
}

// ------------------------------
// FUNCIÓN PARA CATÁLOGOS
// ------------------------------
export async function cargarCatalogos() {
  return enviarXML(process.env.RUTA_CATALOGOS, 'SP_CargarCatalogos'); // Carga catálogo
}

// ------------------------------
// FUNCIÓN PARA SIMULACIÓN
// ------------------------------
export async function cargarSimulacion() {
  return enviarXML(process.env.RUTA_SIMULACION, 'SP_CargarSimulacion');  // Carga datos de simulación
}

// Para probarlas directamente:
// cargarCatalogos();
// cargarSimulacion();
