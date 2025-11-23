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
  // Buscar por numero de finca
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
// ----------------------------
// LLENAR FACTURAS PENDIENTES EN MODAL DE PROPIEDAD
// ----------------------------
function abrirModalPropiedad(propiedad, facturasPend, facturasPag) {
  // Mostrar modal
  modalPropiedad.style.display = "flex";

  // ---------------------------
  // Datos de la propiedad
  // ---------------------------
  datosPropiedadDiv.innerHTML = `
    <h2 class="numero-finca">Número Finca: ${propiedad.NumeroFinca}</h2>
    <div class="propiedad-datos-columnas">
      <div class="columna">
        <p><strong>Número Medidor:</strong> ${propiedad.NumeroMedidor}</p>
        <p><strong>Metros Cuadrados:</strong> ${propiedad.MetrosCuadrados}</p>
        <p><strong>Tipo Uso:</strong> ${propiedad.TipoUso}</p>
        <p><strong>Tipo Zona:</strong> ${propiedad.TipoZona}</p>
      </div>
      <div class="columna">
        <p><strong>Valor Fiscal:</strong> ${propiedad.ValorFiscal}</p>
        <p><strong>Saldo m³ Agua:</strong> ${propiedad.SaldoM3Agua}</p>
        <p><strong>Saldo m³ Última Factura:</strong> ${propiedad.SaldoM3UltimaFactura}</p>
      </div>
      <div class="columna">
        <p><strong>Propietario:</strong> ${propiedad.PropietarioNombre}</p>
        <p><strong>Cédula:</strong> ${propiedad.PropietarioCedula}</p>
        <p><strong>Fecha Registro:</strong> ${propiedad.FechaRegistro.split("T")[0]}</p>
      </div>
    </div>
  `;

  // ---------------------------
  // Facturas pendientes
  // ---------------------------
  tablaFactPend.innerHTML = "";

  // Ordenar facturas pendientes por fecha ascendente
  const facturasOrdenadas = facturasPend.slice().sort(
    (a, b) => new Date(a.FechaFactura) - new Date(b.FechaFactura)
  );

  facturasOrdenadas.forEach((f, index) => {
    const isOldest = index === 0; // solo la factura más vieja
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${f.FechaFactura.split("T")[0]}</td>
      <td>${f.FechaVencimiento.split("T")[0]}</td>
      <td>${f.FechaCuotaAgua.split("T")[0]}</td>
      <td>${f.TotalOriginal}</td>
      <td>${f.TotalFinal}</td>
      <td>${f.Estado}</td>
      <td>
        <button class="btn-pagar" ${isOldest ? "" : "disabled style='background-color:#ccc; cursor:not-allowed;'"}>Pagar</button>
      </td>
    `;

    if (isOldest) {
      const btn = row.querySelector(".btn-pagar");
      btn.addEventListener("click", () => abrirModalPago(f, propiedad.NumeroFinca));
    }

    tablaFactPend.appendChild(row);
  });

  // ---------------------------
  // Facturas pagadas
  // ---------------------------
  tablaFactPag.innerHTML = "";
  facturasPag.forEach(f => {
    const fechaFactura = f.FechaFactura ? f.FechaFactura.split("T")[0] : "";
    const fechaVencimiento = f.FechaVencimiento ? f.FechaVencimiento.split("T")[0] : "";
    const fechaCuotaAgua = f.FechaCuotaAgua ? f.FechaCuotaAgua.split("T")[0] : "";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${fechaFactura}</td>
      <td>${fechaVencimiento}</td>
      <td>${fechaCuotaAgua || ""}</td>
      <td>${f.TotalOriginal}</td>
      <td>${f.TotalFinal}</td>
      <td>${f.Estado}</td>
    `;
    tablaFactPag.appendChild(row);
  });
}




  // ----------------------------
  // LLENAR MODAL DE CÉDULA
  // ----------------------------
function abrirModalPropiedadesCedula(props) {
  modalCedula.style.display = "flex";

  tablaPropsCedula.innerHTML = "";

  if (props.length > 0) {
    document.getElementById("propNombre").textContent = props[0].NombrePropietario;
    document.getElementById("propCedula").textContent = props[0].Cedula;
    document.getElementById("propEmail").textContent = props[0].Email;
    document.getElementById("propTelefono").textContent = props[0].Telefono;
  }

  props.forEach(p => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${p.NumeroFinca}</td>
      <td>${p.NumeroMedidor}</td>
      <td>${p.MetrosCuadrados}</td>
      <td>${p.ValorFiscal}</td>
      <td>${p.TipoUso}</td>
      <td>${p.TipoZona}</td>
    `;

    // Si clickean una fila = abrir modal de propiedad
    row.addEventListener("click", () => {
      modalCedula.style.display = "none";
      buscarPropiedadDesdeCedula(p.NumeroFinca);
    });

    tablaPropsCedula.appendChild(row);
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

  // AL SELECCIONAR UNA PROPIEDAD DESDE EL MODAL DE CÉDULA
  // ----------------------------
  window.buscarPropiedadDesdeCedula = async (numeroFinca) => {
    modalCedula.style.display = "none";
    inputFiltro.value = numeroFinca;
    btnBuscarFinca.click();
  };

// ABRIR MODAL DE PAGO
// ----------------------------
function cerrarModalPago() {
  const modal = document.getElementById("modalPago");
  modal.style.display = "none";
}


window.abrirModalPago = function(factura, numeroFinca) {
  facturaSeleccionada = factura;
  numeroFincaSeleccionada = numeroFinca;

  const modal = document.getElementById("modalPago");
  const infoPagoDiv = document.getElementById("infoPago");
  const tipoPagoSelect = document.getElementById("tipoPagoSelect");

  // Calcular intereses y total
  const hoy = new Date();
  const fechaVenc = new Date(factura.FechaVencimiento);
  let diasMora = 0;
  let interesMoratorio = 0;

  if (hoy > fechaVenc) {
    diasMora = Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24));
    interesMoratorio = (factura.TotalOriginal * 0.04 / 30) * diasMora;
  }
  const totalAPagar = factura.TotalOriginal + interesMoratorio;

  infoPagoDiv.innerHTML = `
    <p><strong>Monto a pagar:</strong> ${factura.TotalOriginal.toFixed(2)}</p>
    <p><strong>Intereses moratorios:</strong> ${interesMoratorio.toFixed(2)}</p>
    <p><strong>Total a pagar:</strong> ${totalAPagar.toFixed(2)}</p>
  `;

  // Reset tipo de pago a efectivo por defecto
  tipoPagoSelect.value = "1";

  modal.style.display = "flex";
};


// Botón para cancelar
document.getElementById("btnCancelarPago").addEventListener("click", () => {
  cerrarModalPago();
});

// Botón para confirmar pago
document.getElementById("btnConfirmarPago").addEventListener("click", async () => {
  if (!facturaSeleccionada || !numeroFincaSeleccionada) return;

  const tipoPagoId = parseInt(document.getElementById("tipoPagoSelect").value, 10);

  try {
    const response = await fetch(`/propiedades/pagarFactura`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        numeroFinca: numeroFincaSeleccionada,
        tipoPagoId: tipoPagoId, // 1=Efectivo, 2=Tarjeta
        fechaPago: new Date().toISOString().split('T')[0] // YYYY-MM-DD
      })
    });
    const data = await response.json();

    if (data.success) {
      // Cerrar modal
      // Mostrar notificación de éxito
       cerrarModalPago();
       mostrarNotificacion("Éxito, factura pagada", "success");
       setTimeout(() => {
        inputFiltro.value = numeroFincaSeleccionada;
        btnBuscarFinca.click();
      }, 200);

    } else {
      mostrarNotificacion(data.message || "Error al pagar factura", "error");
      setTimeout(() => {
        inputFiltro.value = numeroFincaSeleccionada;
        btnBuscarFinca.click();
      }, 200);
    }

  } catch(err) {
    console.error(err);
    mostrarNotificacion("Error al pagar factura", "error");
  }
});


// Cerrar sesión → regresar a index.html
const btnLogout = document.getElementById("btnCerrarSesion");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    window.location.href = "../index.html";
  });
}

// Función general para notificaciones de error o éxito
function mostrarNotificacion(mensaje, tipo = 'success', duracion = 4000) {
  const container = document.getElementById('notificationContainer');
  if (!container) return;

  const notif = document.createElement('div');
  notif.className = `notification ${tipo}`;
  notif.textContent = mensaje;

  container.appendChild(notif);

  // Después del tiempo, eliminar notificación del DOM
  setTimeout(() => {
    notif.remove();
  }, duracion);
}


});
