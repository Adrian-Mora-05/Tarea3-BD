// Importa el enrutador de Express para definir las rutas de la API
import {Router} from 'express';
import express from 'express';


// Importa las funciones del controlador que manejarán las peticiones
import {
  listarInicioEmpleados,
  listarEmpleados,
  insertarEmpleado,
  actualizarEmpleado,
  borrarEmpleado,
  listarMovimientos,
  insertarMovimiento,
  obtenerLosMovimientos,
  listarPuestos
} from '../controllers/empleados.controllers.js';

import {
  hacerLogin,
  hacerLogout
} from '../controllers/login.controllers.js';

// Crea una instancia del enrutador
const router = Router();

// Definición de rutas para la entidad "Empleados"
router.get('/inicio', listarInicioEmpleados);
router.get('/listar', listarEmpleados);
router.get('/puestos', listarPuestos);
router.get('/movimientos', obtenerLosMovimientos);
router.post('/', insertarEmpleado);
router.put('/:ValorDocumentoIdentidad', actualizarEmpleado);
router.delete('/:ValorDocumentoIdentidad', borrarEmpleado);
router.get('/:ValorDocumentoIdentidad/movimientos', listarMovimientos);
router.post('/:valorDocumentoIdentidad/movimientos', insertarMovimiento);
router.post('/login', hacerLogin);
router.post('/logout', hacerLogout);



export default router;