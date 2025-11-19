import { ejecutarSP } from '../database/execSP.js';

export const buscarPorFinca = async (req, res) => {
  const { numeroFinca } = req.params;
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input("inNumeroFinca", sql.NVarChar(50), numeroFinca)
      .output("outResultCode", sql.Int)
      .execute("SP_ConsultarFacturasPropiedad");

    res.json({
      success: true,
      propiedad: result.recordset[0] || null,
      facturasPendientes: result.recordsets[0] || [],
      facturasPagadas: result.recordsets[1] || []
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error consultando la propiedad." });
  }
};

export const buscarPorCedula = async (req, res) => {
  const { cedula } = req.params;
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input("inCedula", sql.NVarChar(50), cedula)
      .output("outResultCode", sql.Int)
      .execute("SP_ListarPropiedadesXCedula");

    res.json({
      success: true,
      propiedades: result.recordset || []
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error consultando propiedades." });
  }
};