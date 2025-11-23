import { ejecutarSP } from '../database/execSP.js';

// propiedades.controllers.js
export const buscarPorFinca = async (req, res) => {
  const { numeroFinca } = req.params; // Obtiene el número de finca enviado por la ruta


  try {
    const result = await ejecutarSP(
      "SP_ConsultarFacturasPropiedad", // Nombre del SP a ejecutar
      [
        { name: "inNumeroFinca", type: "NVarChar", value: numeroFinca, length: 50 }
      ],
      [
        { name: "outResultCode", type: "Int" } // Código de salida
      ]
    );

    const outCode = result.output?.outResultCode; // Obtiene el código retornado por el SP

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
      propiedad: result.recordsets[0]?.[0] || null, // Primer registro de la primera lista
      facturasPendientes: result.recordsets[1] || [], // Segunda lista
      facturasPagadas: result.recordsets[2] || [] // Tercera lista
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
  const { cedula } = req.params; // Obtiene la cédula por parámetros

  try {
    const result = await ejecutarSP(
      "SP_ListarPropiedadesXCedula", // Ejecuta el SP correspondiente
      [
        { name: "inCedula", type: "NVarChar", value: cedula, length: 50 } // Parámetro de entrada
      ],
      [
        { name: "outResultCode", type: "Int" } // Código de salida
      ]
    );

    const outCode = result.output?.outResultCode; // Código devuelto

    // Si el SP indica que no hay propiedades
    if (outCode !== 0) {
      return res.json({
        success: false,
        message: "No se encontraron propiedades para esta cédula."
      });
    }

    return res.json({
      success: true,
      propiedades: result.recordset || [], // Lista de propiedades
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

    // Validación rápida de datos obligatorios
  if (!numeroFinca || !tipoPagoId || !fechaPago) {
    return res.status(400).json({ success: false, message: "Faltan parámetros obligatorios" });
  }

   // Parámetros de entrada para el SP
    const inputs = [
      { name: 'inNumeroFinca', type: 'VarChar', length: 50, value: numeroFinca },
      { name: 'inTipoMedioPagoId', type: 'Int', value: tipoPagoId },
      { name: 'inNumeroReferencia', type: 'VarChar', length: 50, value: numeroReferencia || null },
      { name: 'inFechaPago', type: 'Date', value: fechaPago }
    ];

    // Parámetro de salida del SP
    const outputs = [
      { name: 'outResultCode', type: 'Int' }
    ];

    const result = await ejecutarSP('SP_PagarFactura', inputs, outputs); // Ejecuta el SP de pago
    const code = result.output.outResultCode; // Código retornado por el SP

    // Mensajes por cada código de resultado
    const mensajes = {
      0: { success: true, message: 'Factura pagada exitosamente' },
      52001: { success: false, message: 'Número de finca inválido' },
      52002: { success: false, message: 'Tipo de pago inválido' },
      52003: { success: false, message: 'Propiedad no existe' },
      52004: { success: false, message: 'Propiedad no tiene facturas pendientes' },
      52008: { success: false, message: 'Error interno en la base de datos' }
    };

    // Respuesta final
    res.status(200).json({
      success: code === 0,
      code,
      message: mensajes[code]?.message || 'Error desconocido'
    });

  } catch (err) {
    console.error('Error del servidor:', err); // Error en servidorS
    res.status(500).json({ message: 'Error del servidor' });
  }
};