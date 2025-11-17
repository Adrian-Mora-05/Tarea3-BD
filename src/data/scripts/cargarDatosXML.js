import fs from 'fs';
import sql from 'mssql';
import * as dotenv from 'dotenv';

dotenv.config();

// Config DB
const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  },
};

// ------------------------------
// 🔵 FUNCIÓN GENÉRICA
// ------------------------------
async function enviarXML(xmlPath, nombreSP) {
  try {
    let xmlContent = fs.readFileSync(xmlPath, 'utf-8');

    // Quitar cabecera XML si existe
    xmlContent = xmlContent.replace(/<\?xml[^>]*\?>/, '');

    const pool = await sql.connect(config);

    const resultado = await pool.request()
      .input('inArchivoXML', sql.NVarChar(sql.MAX), xmlContent)
      .output('outResultCode', sql.Int)
      .execute(nombreSP);

    console.log(`✔ Resultado del SP (${nombreSP}):`, resultado.output);

    await sql.close();
  } catch (err) {
    console.error(`Error al enviar el XML con ${nombreSP}:`, err);
  }
}

// ------------------------------
// FUNCIÓN PARA CATÁLOGOS
// ------------------------------
export async function cargarCatalogos() {
  return enviarXML(process.env.RUTA_CATALOGOS, 'SP_CargarCatalogos');
}

// ------------------------------
// FUNCIÓN PARA SIMULACIÓN
// ------------------------------
export async function cargarSimulacion() {
  return enviarXML(process.env.RUTA_SIMULACION, 'SP_CargarSimulacion'); 
}

// Para probarlas directamente:
// cargarCatalogos();
// cargarSimulacion();
