// src/controllers/empleados.controllers.js
import { ejecutarSP } from '../database/execSP.js';

/**
 * GET /empleados/inicio
 */

export const listarInicioEmpleados = async (req, res) => {
  try {
    try {
      // preferimos SP_ListarInicioEmpleado (si existe en tu BD)
      const r = await ejecutarSP(
                                'SP_ListarInicioEmpleado',
                                [], // no hay parámetros de entrada
                                [{ name: 'outResultCode', type: 'Int' }] // parámetro de salida requerido
                              );

      return res.json(r.recordset || []);
    } catch (err) {
     // Fallback: usar SP alternativo con los parámetros correctos
      const r = await ejecutarSP(
        'SP_ListarEmpleadosFiltrados',
        [
          { name: 'Filtro', type: 'NVarChar', length: 100, value: null },
          { name: 'inIdPostByUser', type: 'Int', value: 1 } // Id UsuarioScripts = 1 )
        ],
        [{ name: 'outResultCode', type: 'Int' }]
      );
      return res.json(r.recordset || []);
    }
  } catch (error) {
    console.error('Error listarInicioEmpleados:', error);
    res.status(500).json({ message: 'Error al listar empleados' });
  }
}; 

/**
 * GET /empleados
 * Llama a SP_ListarEmpleados(@Filtro)
 * - Si llega nombre o documento, los pasamos como `Filtro` (SP implementa la lógica).
 * - Si no viene nada, se envía NULL y SP retorna todos (o se puede usar /inicio).
 */
export const listarEmpleados = async (req, res) => {
  try {
    const filtro = req.query.nombre ?? req.query.documento ?? req.query.filtro ?? null;
    const postTime = new Date();
    const userId = parseInt(req.headers['x-user-id'], 10) || 3;
    const userIP = req.headers['x-user-ip'] || '127.0.0.1';
    const r = await ejecutarSP(
                'SP_ListarEmpleadosFiltrados', 
                [{ name: 'inFiltro', type: 'NVarChar', length: 100, value: filtro },
                  { name: 'inIdPostByUser', type: 'Int', value: userId}, // Id UsuarioScripts = 1
                  { name: 'inPostInIP', type: 'NVarChar', length: 50, value: userIP}, // null = todos
                  { name: 'inPostTime', type: 'DateTime', value: postTime } // 1=Nombre ASC
                ], 
              [{ name: 'outResultCode', type: 'Int' }]);
    res.json(r.recordset || []);
  } catch (error) {
    console.error('Error listarEmpleados:', error);
    res.status(500).json({ message: 'Error al listar empleados' });
  }
};

/**
 * POST /empleados
 * Invoca SP_InsertarEmpleados
 * Espera en body: { ValorDocumentoIdentidad, Nombre, IdPuesto, FechaContratacion, SaldoVacaciones?, EsActivo? }
 * (SaldoVacaciones opcional -> por defecto 0, EsActivo por defecto 1)
 */
export const insertarEmpleado = async (req, res) => {
  try {
    const {
      ValorDocumentoIdentidad,
      Nombre,
      IdPuesto,
      FechaContratacion,
      SaldoVacaciones = 0,
      EsActivo = 1
    } = req.body;

    if (!ValorDocumentoIdentidad || !Nombre || !IdPuesto) {
      return res.status(400).json({ message: 'Faltan campos obligatorios: Documento de identidad, nombre, puesto' });
    }

      // Obtener fecha/hora actual en zona horaria de Costa Rica
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Costa_Rica',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const fechaHoraCRString = formatter.format(new Date()); // Ej: "10/18/2025, 14:45:30"
    const [fechaCR, horaCR] = fechaHoraCRString.split(', ');
    const [mes, dia, anio] = fechaCR.split('/');
    const fechaHoraCostaRica = new Date(`${anio}-${mes}-${dia}T${horaCR}`);

    // Si no se recibe FechaContratacion, usar la fecha actual de CR (sin hora)
    const fechaContratacionCR = FechaContratacion
      ? new Date(FechaContratacion)
      : new Date(`${anio}-${mes}-${dia}`); // "YYYY-MM-DD" formato local

    const userId = parseInt(req.headers['x-user-id'], 10) || 3;
    const userIP = req.headers['x-user-ip'] || '127.0.0.1';

    const inputs = [
      { name: 'inValorDocumentoIdentidad', type: 'VarChar', length: 32, value: ValorDocumentoIdentidad },
      { name: 'inNombre', type: 'VarChar', length: 64, value: Nombre },
      { name: 'inIdPuesto', type: 'Int', value: parseInt(IdPuesto, 10) },
      { name: 'inFechaContratacion', type: 'Date', value: fechaContratacionCR  },
      { name: 'inSaldoVacaciones', type: 'Money', value: SaldoVacaciones },
      { name: 'inEsActivo', type: 'Int', value: EsActivo },
      { name: 'inIdPostByUser', type: 'Int', value: userId }, // 
      { name: 'inPostInIP', type: 'NVarChar', length: 50, value: userIP },  
      { name: 'inPostTime', type: 'DateTime', value: fechaHoraCostaRica  }
    ];

    const outputs = [{ name: 'outResultCode', type: 'Int' }];

    const r = await ejecutarSP('SP_InsertarEmpleados', inputs, outputs);
    const code = r.output?.outResultCode ?? null;

    if (code === 0) {
      return res.status(201).json({ success: true });
    }

    // Mapear códigos de error comunes del SP a respuestas HTTP y mensajes
    const map = {
      50004: { status: 400, message: 'Empleado con documento identidad ya existe' },
      50005: { status: 400, message: 'Empleado con mismo nombre ya existe' },
      50008: { status: 500, message: 'Error en base de datos' },
    };

    if (code && map[code]) {
      return res.status(map[code].status).json({ success: false, codigo: code, message: map[code].message });
    }

    // cualquier otro código
    return res.status(500).json({ success: false, codigo: code, message: 'Error inesperado al insertar' });
  } catch (error) {
    console.error('insertarEmpleado error:', error);
    res.status(500).json({ message: 'Error del servidor al insertar empleado' });
  }
};

/**
 * PUT /empleados/:id
 * Invoca SP_ActualizarEmpleado
 * Se asume signature similar a SP_InsertarEmpleados + inId
 */

export const listarPuestos = async (req, res) => {
  try {
    const r = await ejecutarSP('SP_ListarPuestos',
                                [], // no hay parámetros de entrada
                                [{ name: 'outResultCode', type: 'Int' }] // parámetro de salida requerido
                              );
    const puestos = r.recordset || [];
    res.json(puestos.sort((a, b) => a.Nombre.localeCompare(b.Nombre)));
  } catch (error) {
    console.error('Error al listar puestos:', error);
    res.status(500).json({ message: 'Error al obtener puestos' });
  }
};

export const obtenerLosMovimientos = async (req, res) => {
  try {
    const r = await ejecutarSP('SP_ObtenerMovimientos',
                                [], // no hay parámetros de entrada
                                [{ name: 'outResultCode', type: 'Int' }] // parámetro de salida requerido
                              );
    const movimientos = r.recordset || [];
    res.json(movimientos.sort((a, b) => a.Nombre.localeCompare(b.Nombre)));
  } catch (error) {
    console.error('Error al listar movimientos:', error);
    res.status(500).json({ message: 'Error al obtener movimientos' });
  }
};

export const actualizarEmpleado = async (req, res) => {
  try {
    const ValorDocumentoIdentidadViejo = req.params.ValorDocumentoIdentidad;
    const {
      valorDocumentoIdentidad: ValorDocumentoIdentidadNuevo,
      nombre,
      puesto
    } = req.body;

    if (!ValorDocumentoIdentidadViejo || !ValorDocumentoIdentidadNuevo || !nombre || !puesto) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const userId = parseInt(req.headers['x-user-id'], 10) || 3;
    const userIP = req.headers['x-user-ip'] || '127.0.0.1';


    const inputs = [
      { name: 'inValorDocumentoIdentidadViejo', type: 'VarChar', length: 50, value: ValorDocumentoIdentidadViejo },
      { name: 'inValorDocumentoIdentidadNuevo', type: 'VarChar', length: 50, value: ValorDocumentoIdentidadNuevo },
      { name: 'inIdPuesto', type: 'Int', value: parseInt(puesto, 10) },
      { name: 'inNombre', type: 'VarChar', length: 100, value: nombre },
      { name: 'inIdPostByUser', type: 'Int', value: userId }, // cambiar esto luego con el usuario logueado
      { name: 'inPostInIP', type: 'NVarChar', length: 50, value: userIP },  // cambiar esto
      { name: 'inPostTime', type: 'DateTime', value: new Date() }
    ];

    const outputs = [{ name: 'outResultCode', type: 'Int' }];
    const r = await ejecutarSP('SP_ActualizarEmpleado', inputs, outputs);
    const code = r.output?.outResultCode ?? null;

    if (code === 0) return res.json({ success: true });
    if (code === 50120) return res.status(404).json({ message: 'Empleado no encontrado' });
    if (code === 50006) return res.status(400).json({ message: 'Documento duplicado' });
    if (code === 50007) return res.status(400).json({ message: 'Nombre duplicado' });
    if (code === 50008) return res.status(500).json({ message: 'Error de base de datos' });

    return res.status(400).json({ message: 'Error desconocido', codigo: code });

  } catch (error) {
    console.error('actualizarEmpleado error:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar empleado' });
  }
};


/**
 * DELETE /empleados/:id
 * Invoca SP_BorrarEmpleado (se asume signature inId, outResultCode)
 */
export const borrarEmpleado = async (req, res) => {
  try {
    const ValorDocumentoIdentidad = req.params.ValorDocumentoIdentidad;
    if (!ValorDocumentoIdentidad) return res.status(400).json({ message: 'DocumentoIdentidad inválido' });

    const userId = parseInt(req.headers['x-user-id'], 10) || 3;
    const userIP = req.headers['x-user-ip'] || '127.0.0.1';

    const inputs = [{ name: 'inValorDocumentoIdentidad', type: 'NVarChar', length: 50, value: ValorDocumentoIdentidad},
                    { name: 'inConfirmado', type: 'Bit', value: 1 }, // Confirmado = true
                     { name: "inIdPostByUser", type: "Int", value: userId }, // luego reemplazamos con el usuario logueado
                     { name: "inPostInIP", type: "NVarChar", length: 50, value: userIP },
                     { name: "inPostTime", type: "DateTime", value: new Date() },
    ];
    const outputs = [{ name: 'outResultCode', type: 'Int' }];

    const r = await ejecutarSP('SP_BorrarEmpleado', inputs, outputs);
    const code = r.output?.outResultCode ?? null;

    if (code === 0) return res.json({ success: true });
    if (code === 50008) return res.status(400).json({ success: false, codigo: code, message: 'Empleado no encontrado o no se puede borrar' });

    return res.status(400).json({ success: false, codigo: code, message: 'Error al borrar empleado' });
  } catch (error) {
    console.error('borrarEmpleado error:', error);
    res.status(500).json({ message: 'Error del servidor al borrar empleado' });
  }
};

/**
 * GET /empleados/:id/movimientos
 * Llama a SP_ListarMovimientos (se asume recibe inIdEmpleado)
 */
export const listarMovimientos = async (req, res) => {
  try {
    const ValorDocumentoIdentidad = req.params.ValorDocumentoIdentidad;
    if (!ValorDocumentoIdentidad) return res.status(400).json({ message: 'DocumentoIdentidad requerido' });

    const inputs = [{ name: 'inIdEmpleado', type: 'VarChar', length: 32, value: ValorDocumentoIdentidad }];
    const outputs = [
      { name: 'outResultCode', type: 'Int' }
    ];
    const resultado = await ejecutarSP('SP_ListarMovimientos', inputs, outputs);

    const code = resultado.output?.outResultCode ?? 50008;

    if (code !== 0) {
      return res.status(400).json({ success: false, codigo: code, message: 'Error al listar movimientos' });
    }

    return res.json({ success: true, movimientos: resultado.recordset });
  } catch (error) {
    console.error("Error al listar movimientos:", error);
    res.status(500).json({ message: "Error del servidor al listar movimientos" });
  }
};  

/**
 * POST /movimientos
 * Invoca SP_InsertarMovimiento
 */




export const insertarMovimiento = async (req, res) => {
  try {
    const {
      valorDocumentoIdentidad,
      idTipoMovimiento,
      fecha,
      monto,
      idPostByUser,
      postInIP,
      postTime
    } = req.body;

    if (!valorDocumentoIdentidad || !idTipoMovimiento || !fecha || !monto || !idPostByUser || !postInIP || !postTime) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const userId = parseInt(req.headers['x-user-id'], 10) || 3;
    const userIP = req.headers['x-user-ip'] || '127.0.0.1';

    const inputs = [
      { name: 'inIdEmpleado', type: 'VarChar', length: 32, value: valorDocumentoIdentidad},
      { name: 'inIdTipoMovimiento', type: 'Int', value: parseInt(idTipoMovimiento, 10) },
      { name: 'inFecha', type: 'DateTime', value: fecha ? fecha : new Date() },
      { name: 'inMonto', type: 'Money', value: monto },
      { name: 'inIdPostByUser', type: 'Int', value: userId },
      { name: 'inPostInIP', type: 'VarChar', length: 15, value: userIP },
      { name: 'inPostTime', type: 'DateTime', value: postTime ? postTime : new Date() },
    ];

    const outputs = [{ name: 'outResultCode', type: 'Int' }];

    const r = await ejecutarSP('SP_InsertarMovimiento', inputs, outputs);
    console.log("r de SP_InsertarMovimiento:", r);

    
    const code = r.output?.outResultCode ?? null;
 

    if (code === 0) return res.status(201).json({ success: true });
    // mapear errores comunes que defina tu SP_InsertarMovimiento
    if (code === 50011) return res.status(400).json({ success: false, codigo: code, message: 'Monto del movimiento rechazado pues si se aplicar el saldo sería negativo' });

    return res.status(400).json({ success: false, codigo: code, message: 'Error al insertar movimiento' });
  } catch (error) {
    console.error('insertarMovimiento error:', error);
    res.status(500).json({ message: 'Error del servidor al insertar movimiento'});
  }
};
 