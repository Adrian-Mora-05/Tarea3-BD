// Importa el enrutador de Express para definir las rutas de la API
import {Router} from 'express';
import express from 'express';


// Importa las funciones del controlador que manejarán las peticiones


import {
  hacerLogin
} from '../controllers/login.controllers.js';

// Crea una instancia del enrutador
const router = Router();

// Definición de rutas para la entidad "Empleados"

router.post('/login', hacerLogin);




export default router;