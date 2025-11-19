// Importa el enrutador de Express para definir las rutas de la API
import {Router} from 'express';
import express from 'express';


// Importa las funciones del controlador que manejarán las peticiones
import {
  buscarPorFinca,
  buscarPorCedula
} from '../controllers/propiedades.controllers.js';


import {
  hacerLogin
} from '../controllers/login.controllers.js';

// Crea una instancia del enrutador
const router = Router();

// Definición de rutas para la entidad "Empleados"

router.post('/login', hacerLogin);
router.get('/finca/:numeroFinca', buscarPorFinca);
router.get('/cedula/:cedula', buscarPorCedula);



export default router;