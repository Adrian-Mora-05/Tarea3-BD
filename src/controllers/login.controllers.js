// src/controllers/login.controllers.js
import { ejecutarSP } from '../database/execSP.js';

export const hacerLogin = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ message: 'Faltan credenciales' });
    }

    const userIP = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const postTime = new Date();

    const inputs = [
      { name: 'inUser', type: 'VarChar', length: 50, value: usuario },
      { name: 'inPassword', type: 'VarChar', length: 100, value: contrasena },
      { name: 'inPostInIP', type: 'VarChar', length: 50, value: userIP },
      { name: 'inPostTime', type: 'DateTime', value: postTime }
    ];

    const outputs = [
      { name: 'outResultCode', type: 'Int' },
      { name: 'outBloquear', type: 'Int' },
      { name: 'outUserId', type: 'Int' }
    ];

    const result = await ejecutarSP('SP_Login', inputs, outputs);

    res.status(200).json({
      resultCode: result.output.outResultCode,
      bloquear: result.output.outBloquear === 1,
      userId: result.output.outUserId,
      userIP: userIP
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


export const hacerLogout = async (req, res) => {
  try {
    const userId = parseInt(req.headers['x-user-id'], 10) || 3;
    const userIP = req.headers['x-user-ip'] || '127.0.0.1';
    const postTime = new Date();

    if (!userId) {
      return res.status(400).json({ message: 'Usuario no autenticado' });
    }

    const inputs = [
      { name: 'inIdPostByUser', type: 'Int', value: userId },
      { name: 'inPostInIP', type: 'VarChar', length: 50, value: userIP },
      { name: 'inPostTime', type: 'DateTime', value: postTime }
    ];

    const outputs = [
      { name: 'outResultCode', type: 'Int' }
    ];

    const result = await ejecutarSP('SP_Logout', inputs, outputs);

    const code = result.output.outResultCode;
    if (code === 0) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, code });
    }
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ message: 'Error del servidor al cerrar sesión' });
  }
};
