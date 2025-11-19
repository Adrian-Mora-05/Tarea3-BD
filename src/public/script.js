// script.js

document.addEventListener("DOMContentLoaded", () => {
  const inputFiltro = document.getElementById("filtroInput");
  const btnBuscarFinca = document.getElementById("btnBuscarFinca");
  const btnBuscarCedula = document.getElementById("btnBuscarCedula");
  const errorBusqueda = document.getElementById("errorBusqueda");

  // Función para mostrar error
  function mostrarError(msg) {
    errorBusqueda.textContent = msg;
  }

  // Función para limpiar error
  function limpiarError() {
    errorBusqueda.textContent = "";
  }

  // Buscar por # de finca
  btnBuscarFinca.addEventListener("click", async () => {
    limpiarError();
    const valor = inputFiltro.value.trim();
    if (!valor) {
      mostrarError("Por favor ingrese un número de finca.");
      return;
    }

    try {
      // Llamada al backend
      const response = await fetch(`/propiedades/finca/${valor}`);
      const data = await response.json();

      if (data.success) {
        abrirModalPropiedad(data.propiedad, data.facturasPendientes, data.facturasPagadas);
      } else {
        mostrarError(data.message || "No se encontró la propiedad.");
      }
    } catch (err) {
      mostrarError("Error al consultar la propiedad.");
      console.error(err);
    }
  });

  // Buscar por cédula
  btnBuscarCedula.addEventListener("click", async () => {
    limpiarError();
    const valor = inputFiltro.value.trim();
    if (!valor) {
      mostrarError("Por favor ingrese un ID de propietario.");
      return;
    }

    try {
      const response = await fetch(`/propiedades/cedula/${valor}`);
      const data = await response.json();

      if (data.success) {
        abrirModalPropiedadesCedula(data.propiedades);
      } else {
        mostrarError(data.message || "No se encontraron propiedades para esta cédula.");
      }
    } catch (err) {
      mostrarError("Error al consultar propiedades.");
      console.error(err);
    }
  });

  // Funciones para abrir modales (sólo placeholders por ahora)
  function abrirModalPropiedad(propiedad, facturasPendientes, facturasPagadas) {
    const modal = document.getElementById("modalPropiedad");
    modal.style.display = "block";

    // Aquí iría la lógica para rellenar los datos en los tables
    console.log(propiedad, facturasPendientes, facturasPagadas);
  }

  function abrirModalPropiedadesCedula(propiedades) {
    const modal = document.getElementById("modalPropiedadesCedula");
    modal.style.display = "block";

    console.log(propiedades);
  }
});
