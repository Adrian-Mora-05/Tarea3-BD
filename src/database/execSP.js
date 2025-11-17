// src/database/execSp.js
import { getConnection } from './connection.js';
import sql from 'mssql';

/**
 * Mapa simple de nombres de tipos a sql.<Tipo>

 */
const TYPE_MAP = {
  Int: sql.Int,
  VarChar: sql.VarChar,
  NVarChar: sql.NVarChar,
  Money: sql.Money,
  Date: sql.Date,
  DateTime: sql.DateTime,
  Bit: sql.Bit,
  Float: sql.Float,
};

/**
 * Ejecuta un stored procedure cualquiera, sin importar los parametros o cuál SP es.
 *
 * @param {string} spName - nombre del SP (ej: 'SP_ListarEmpleados')
 * @param {Array} inputs - array de { name, type, value, length? } (type: 'Int'|'VarChar'|...)
 * @param {Array} outputs - array de { name, type, length? }
 *
 * @returns {Promise<object>} resultado bruto devuelto por mssql (recordset, output, rowsAffected...)
 */
export async function ejecutarSP(spName, inputs = [], outputs = []) {
  try {
  const pool = await getConnection();

  const req = pool.request();

  // inputs
  for (const inp of inputs) {
    const { name, type, value, length } = inp;
    if (!name) throw new Error('Input sin name en ejecutarSP');
    if (!type) {
      // tipo por defecto a NVARCHAR(MAX)
      req.input(name, sql.NVarChar(sql.MAX), value);
      continue;
    }
    const sqlType = TYPE_MAP[type];
    if (!sqlType) throw new Error(`Tipo SQL no soportado en ejecutarSP: ${type}`);
    if ((type === 'VarChar' || type === 'NVarChar') && length) {
      req.input(name, sqlType(length), value);
    } else if (type === 'VarChar' || type === 'NVarChar') {
      // tamaño máximo por defecto
      req.input(name, sqlType(sql.MAX), value);
    } else {
      req.input(name, sqlType, value);
    }
  }

  // outputs
  for (const out of outputs) {
    const { name, type, length } = out;
    if (!name) throw new Error('Output sin name en ejecutarSP');
    const sqlType = TYPE_MAP[type];
    if (!sqlType) throw new Error(`Tipo SQL no soportado en output de ejecutarSP: ${type}`);
    if ((type === 'VarChar' || type === 'NVarChar') && length) {
      req.output(name, sqlType(length));
    } else if (type === 'VarChar' || type === 'NVarChar') {
      req.output(name, sqlType(sql.MAX));
    } else {
      req.output(name, sqlType);
    }
  }

  const resultado = await req.execute(spName);
  return resultado;
  } catch (error) {
    console.error('Error en ejecutarSP:', error);
    throw error;
  }
}
