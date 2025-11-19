// src/controllers/login.controllers.js
import { ejecutarSP } from '../database/execSP.js';

export const hacerLogin = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ message: 'Faltan credenciales' });
    }

    const inputs = [
      { name: 'inUser', type: 'VarChar', length: 100, value: usuario },
      { name: 'inPassword', type: 'VarChar', length: 100, value: contrasena }
    ];

    const outputs = [
      { name: 'outResultCode', type: 'Int' }
    ];

    const result = await ejecutarSP('SP_Login', inputs, outputs);

    res.status(200).json({
      resultCode: result.output.outResultCode
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


