// Importa la instancia de la aplicación Express desde el archivo app.js
import app from './app.js';
import express from "express";
import { DB, PORT } from "./config.js";

//Inicia el servidor web en el puerto 4000
app.listen(PORT, () => {
  console.log(`Servidor de la tarea 3 iniciado en http://localhost:${PORT}`);
});
   