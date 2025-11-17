import express from 'express'; // Importa el framework Express para crear la aplicación web

// Importa las rutas relacionadas con los empleados desde el archivo
import empleadoRoutes from './routes/empleados.routes.js';

//configuración para ingresar a la carpeta public(lo que queremos que haga la pagina web)
const app = express(); // Crea una instancia de la aplicación Express
app.use(express.json()); 

// Parsear las solicitudes con cuerpo en formato JSON
// Esto permite recibir datos en JSON desde el cliente 
app.use(express.static("public"));

// Agrega las rutas de empleados a la aplicación
app.use('/empleados', empleadoRoutes);
// Exporta la instancia de la aplicación para poder usarla en otros archivos
export default app;