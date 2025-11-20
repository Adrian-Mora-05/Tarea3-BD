import { ejecutarSP } from '../database/execSP.js';

// propiedades.controllers.js
export const buscarPorFinca = async (req, res) => {
  const { numeroFinca } = req.params;

  try {
    const result = await ejecutarSP(
      "SP_ConsultarFacturasPropiedad",
      [
        { name: "inNumeroFinca", type: "NVarChar", value: numeroFinca, length: 50 }
      ],
      [
        { name: "outResultCode", type: "Int" }
      ]
    );

    const outCode = result.output?.outResultCode;

    // Si el SP indica error
    if (outCode !== 0) {
      return res.json({
        success: false,
        message: "No se encontró esta propiedad o hubo un error consultándola."
      });
    }

    // Este SP devuelve tres recordsets:
    //  0 = datos propiedad
    //  1 = facturas pendientes
    //  2 = facturas pagadas
    return res.json({
      success: true,
      propiedad: result.recordsets[0]?.[0] || null,
      facturasPendientes: result.recordsets[1] || [],
      facturasPagadas: result.recordsets[2] || []
    });

  } catch (err) {
    console.error("Error en buscarPorFinca:", err);
    return res.json({
      success: false,
      message: "Error consultando datos de la propiedad."
    });
  }
};


// propiedades.controllers.js
export const buscarPorCedula = async (req, res) => {
  const { cedula } = req.params;

  try {
    const result = await ejecutarSP(
      "SP_ListarPropiedadesXCedula",
      [
        { name: "inCedula", type: "NVarChar", value: cedula, length: 50 }
      ],
      [
        { name: "outResultCode", type: "Int" }
      ]
    );

    const outCode = result.output?.outResultCode;

    if (outCode !== 0) {
      return res.json({
        success: false,
        message: "No se encontraron propiedades para esta cédula."
      });
    }

    return res.json({
      success: true,
      propiedades: result.recordset || [],
    });

  } catch (err) {
    console.error("Error en buscarPorCedula:", err);
    return res.json({
      success: false,
      message: "Error consultando propiedades."
    });
  }
};
