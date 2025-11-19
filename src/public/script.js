// script.js

document.addEventListener("DOMContentLoaded", () => {
  const inputFiltro = document.getElementById("filtroInput");
  const btnBuscarFinca = document.getElementById("btnBuscarFinca");
  const btnBuscarCedula = document.getElementById("btnBuscarCedula");
  const errorBusqueda = document.getElementById("errorBusqueda");

  const modalPropiedad = document.getElementById("modalPropiedad");
  const modalCedula = document.getElementById("modalPropiedadesCedula");
  
  const tablaFactPend = document.querySelector("#tablaFacturasPendientes tbody");
  const tablaFactPag = document.querySelector("#tablaFacturasPagadas tbody");
  const tablaPropsCedula = document.querySelector("#tablaPropiedadesCedula tbody");

  const datosPropiedadDiv = document.getElementById("datosPropiedad");

  // Función para mostrar error
  function mostrarError(msg) {
    errorBusqueda.textContent = msg;
  }

  // Función para limpiar error
  function limpiarError() {
    errorBusqueda.textContent = "";
  }

  // ---------------------
  // Buscar por # de finca
  // ---------------------
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

  // ---------------------
  // Buscar por cédula
  // ---------------------
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


  // ----------------------------
  // LLENAR MODAL DE PROPIEDAD
  // ----------------------------
  function abrirModalPropiedad(propiedad, facturasPend, facturasPag) {
    modalPropiedad.style.display = "block";

    // Llenar info de propiedad
    datosPropiedadDiv.innerHTML = `
      <p><strong>Número Finca:</strong> ${propiedad.NumeroFinca}</p>
      <p><strong>Propietario:</strong> ${propiedad.Propietario}</p>
      <p><strong>Tipo Zona:</strong> ${propiedad.TipoZona}</p>
      <p><strong>Tipo Uso:</strong> ${propiedad.TipoUso}</p>
    `;

    // Llenar facturas pendientes
    tablaFactPend.innerHTML = "";
    facturasPend.forEach(f => {
      const row = `
        <tr>
          <td>${f.FechaFactura}</td>
          <td>${f.Vencimiento}</td>
          <td>${f.MontoOriginal} ₡</td>
          <td>${f.MontoFinal} ₡</td>
          <td>${f.Estado}</td>
          <td><button onclick="abrirModalPago(${f.IdFactura})">Pagar</button></td>
        </tr>
      `;
      tablaFactPend.insertAdjacentHTML("beforeend", row);
    });

    // Llenar facturas pagadas
    tablaFactPag.innerHTML = "";
    facturasPag.forEach(f => {
      const row = `
        <tr>
          <td>${f.FechaFactura}</td>
          <td>${f.Vencimiento}</td>
          <td>${f.MontoOriginal} ₡</td>
          <td>${f.MontoFinal} ₡</td>
          <td>${f.Estado}</td>
        </tr>
      `;
      tablaFactPag.insertAdjacentHTML("beforeend", row);
    });
  }


  // ----------------------------
  // LLENAR MODAL DE CÉDULA
  // ----------------------------
  function abrirModalPropiedadesCedula(props) {
    modalCedula.style.display = "block";

    tablaPropsCedula.innerHTML = "";

    props.forEach(p => {
      const row = `
        <tr>
          <td>${p.NumeroFinca}</td>
          <td>${p.TipoUso}</td>
          <td>${p.TipoZona}</td>
          <td><button onclick="buscarPropiedadDesdeCedula('${p.NumeroFinca}')">Ver</button></td>
        </tr>
      `;
      tablaPropsCedula.insertAdjacentHTML("beforeend", row);
    });
  }


  // ----------------------------
  // CERRAR MODALES
  // ----------------------------
  document.getElementById("btnCerrarModalPropiedad").addEventListener("click", () => {
    modalPropiedad.style.display = "none";
  });

  document.getElementById("btnCerrarModalCedula").addEventListener("click", () => {
    modalCedula.style.display = "none";
  });

  // ----------------------------
  // AL SELECCIONAR UNA PROPIEDAD DESDE EL MODAL DE CÉDULA
  // ----------------------------
  window.buscarPropiedadDesdeCedula = async (numeroFinca) => {
    modalCedula.style.display = "none";
    inputFiltro.value = numeroFinca;
    btnBuscarFinca.click();
  };


  // ----------------------------
  // ABRIR MODAL DE PAGO
  // ----------------------------
  // DESPUES IMPLEMENTAMOS LA LÓGICA DE PAGO
  window.abrirModalPago = function(idFactura) {
  const modal = document.getElementById("modalPago");
  modal.style.display = "block";

  console.log("Factura seleccionada:", idFactura);
};


});
