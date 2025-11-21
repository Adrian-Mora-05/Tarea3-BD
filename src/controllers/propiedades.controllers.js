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
        message: "No se encontró esta propiedad."
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


export const pagarFactura = async (req, res) => {
  try {
    const {  numeroFinca, tipoPagoId, numeroReferencia, fechaPago } = req.body;

  if (!numeroFinca || !tipoPagoId || !fechaPago) {
    return res.status(400).json({ success: false, message: "Faltan parámetros obligatorios" });
  }

    const inputs = [
      { name: 'inNumeroFinca', type: 'VarChar', length: 50, value: numeroFinca },
      { name: 'inTipoMedioPagoId', type: 'Int', value: tipoPagoId },
      { name: 'inNumeroReferencia', type: 'VarChar', length: 50, value: numeroReferencia || null },
      { name: 'inFechaPago', type: 'Date', value: fechaPago }
    ];

    const outputs = [
      { name: 'outResultCode', type: 'Int' }
    ];

    const result = await ejecutarSP('SP_PagarFactura', inputs, outputs);
    const code = result.output.outResultCode;

    const mensajes = {
      0: { success: true, message: 'Factura pagada exitosamente' },
      52001: { success: false, message: 'Número de finca inválido' },
      52002: { success: false, message: 'Tipo de pago inválido' },
      52003: { success: false, message: 'Propiedad no existe' },
      52004: { success: false, message: 'Propiedad no tiene facturas pendientes' },
      52008: { success: false, message: 'Error interno en la base de datos' }
    };

    res.status(200).json({
      success: code === 0,
      code,
      message: mensajes[code]?.message || 'Error desconocido'
    });

  } catch (err) {
    console.error('Error del servidor:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};