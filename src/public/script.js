document.addEventListener("DOMContentLoaded", () => {
  const tabla = document.getElementById("empleadosTable").querySelector("tbody");
  const filtroInput = document.getElementById("filtroInput");
  const btnFiltrar = document.getElementById("btnFiltrar");
  const btnInsertarEmpleado = document.getElementById("btnInsertarEmpleado");


  let empleados = [];
  let seleccionado = null;

  // 🔹 Cargar todos los empleados al inicio
  async function cargarEmpleados() {
    try {
      const res = await fetch("/empleados/inicio");
      if (!res.ok) throw new Error("Error al cargar empleados");
      empleados = await res.json();
      mostrarEmpleados(empleados);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los empleados.");
    }
  }

  // 🔹 Mostrar empleados en la tabla
  function mostrarEmpleados(lista) {
    tabla.innerHTML = "";

    lista.forEach(emp => {
  
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${emp.Nombre}</td>
        <td>${emp.DocumentoIdentidad}</td>
        <td>${emp.NombrePuesto || ""}</td>
        <td>${
          emp.FechaContratacion
            ? (() => {
                const [year, month, day] = emp.FechaContratacion.slice(0, 10).split("-");
                return `${day}/${month}/${year}`;
              })()
            : ""
        }</td>
        <td>${emp.SaldoVacaciones?.toFixed(2) ?? "0.00"}</td>
        <td style="color: ${Number(emp.EsActivo) === 1 ? 'black' : 'red'};">
          ${Number(emp.EsActivo) === 1 ? "Activo" : "Inactivo"}
        </td>



      <td class="acciones">
        <button class="btn-accion actualizar" title="Actualizar este empleado" data-id="${emp.DocumentoIdentidad}">✏️</button>
        <button class="btn-accion borrar" title="Borrar este empleado" data-id="${emp.DocumentoIdentidad}" ${Number(emp.EsActivo) === 0 ? "disabled" : ""}>🗑️</button>
        <button class="btn-accion insertar-mov" title="Insertar movimiento a este empleado" data-id="${emp.DocumentoIdentidad}">➕</button>
        <button class="btn-accion listar-mov" title="Listar movimientos de este empleado" data-id="${emp.DocumentoIdentidad}">📋</button>
      </td>
    `;
    tabla.appendChild(fila);
  });

    // Actualizar selección
    document.querySelectorAll("input[name='seleccionEmpleado']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        seleccionado = e.target.value;
      });
    });
  }

  // 🔹 Filtrar empleados
  btnFiltrar.addEventListener("click", async () => {
    const filtro = filtroInput.value.trim();
    let url = "/empleados/listar";

    if (filtro !== "") {
      url += `?filtro=${encodeURIComponent(filtro)}`;
    }

    try {
      const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": sessionStorage.getItem('userId'),
        "X-User-IP": sessionStorage.getItem('userIP')
      }
    });
      if (!res.ok) throw new Error("Error al filtrar");
      const data = await res.json();
      mostrarEmpleados(data);
    } catch (err) {
      console.error(err);
      alert("No se pudieron filtrar los empleados.");
    }
  });

  async function obtenerPuestos() {
    try {
      const res = await fetch('/empleados/puestos'); 
      if (!res.ok) throw new Error('No se pudieron obtener los puestos');
      return await res.json();
    } catch (err) {
      console.error('Error al obtener puestos:', err);
      return [];
    }
  }
  


  async function obtenerMovimientos() {
    try {
      const res = await fetch('/empleados/movimientos'); // Asegurate de tener esta ruta en el backend
      if (!res.ok) throw new Error('No se pudieron obtener los movimientos');
      return await res.json();
    } catch (err) {
      console.error('Error al obtener movimientos:', err);
      return [];
    }
  }

  const docInput = document.getElementById("docInput");
  const nombreInput = document.getElementById("nombreInput");
  const docError = document.getElementById("docError");
  const nombreError = document.getElementById("nombreError");
  
  const insertDocInput = document.getElementById("docInputInsertar");
  const insertNombreInput = document.getElementById("nombreInputInsertar");
  const insertDocError = document.getElementById("docErrorInsertar");
  const insertNombreError = document.getElementById("nombreErrorInsertar"); 

  // Documento: solo números
  docInput.addEventListener("input", function () {
    const original = this.value;
    const limpio = original.replace(/\D/g, "");

    this.value = limpio;

    if (original !== limpio) {
      docError.textContent = "Solo se permiten números.";
    } else {
      docError.textContent = "";
    }
  });

  // Nombre: letras, guiones, espacios, solo un punto
  nombreInput.addEventListener("input", function () {
    let valor = this.value;
    const limpio = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ .\-]/g, "");

    // Solo un punto permitido
    const partes = limpio.split(".");
    if (partes.length > 2) {
      valor = partes[0] + "." + partes.slice(1).join("").replace(/\./g, "");
      nombreError.textContent = "Solo se permite un punto.";
    } else {
      nombreError.textContent = "";
      valor = limpio;
    }

    this.value = valor;

    // Mensaje si se intentó escribir caracteres inválidos
    if (valor !== this.value) {
      nombreError.textContent = "Solo se permiten letras, espacios, guiones y un punto.";
    }
  });
 
  insertDocInput.addEventListener("input", function () {
    const original = this.value;
    const limpio = original.replace(/\D/g, "");
    this.value = limpio;

    if (original !== limpio) {
      insertDocError.textContent = "Documento identidad solo puede ser numérico.";
    } else {
      insertDocError.textContent = "";
    }
  });

  insertNombreInput.addEventListener("input", function () {
    let valor = this.value;
    const limpio = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ .\-]/g, "");

    // Solo un punto permitido
    const partes = limpio.split(".");
    if (partes.length > 2) {
      valor = partes[0] + "." + partes.slice(1).join("").replace(/\./g, "");
      insertNombreError.textContent = "Solo se permite un punto.";
    } else {
      insertNombreError.textContent = "";
      valor = limpio;
    }

    this.value = valor;

    if (valor !== this.value) {
      insertNombreError.textContent = "Solo letras, guiones, espacios y un punto.";
    }
  });


  // Insertar nuevo empleado
  
  btnInsertarEmpleado.addEventListener("click", async () => {
    const puestos = await obtenerPuestos();
    if (puestos.length === 0) {
      mostrarNotificacion("No hay puestos disponibles para asignar.", "error");
      return;
    }
    mostrarModalInsertarEmpleado(puestos);
  });

mostrarModalInsertarEmpleado = (puestos) => {
  const modal = document.getElementById("modalInsertarEmpleado");
  const overlay = document.getElementById("modalOverlay");
  const form = document.getElementById("formInsertarEmpleado");

  const insertDocInput = document.getElementById("docInputInsertar");
  const insertNombreInput = document.getElementById("nombreInputInsertar");
  const insertDocError = document.getElementById("docErrorInsertar");
  const insertNombreError = document.getElementById("nombreErrorInsertar");
  const puestoSelect = document.getElementById("puestoSelectInsertar");
  const cancelarBtn = document.getElementById("cancelarInsertarBtn");

  // Limpiar campos y errores
  insertDocInput.value = "";
  insertNombreInput.value = "";
  insertDocError.textContent = "";
  insertNombreError.textContent = "";

  insertDocInput.classList.remove("input-error");
  insertNombreInput.classList.remove("input-error");
  puestoSelect.classList.remove("input-error");

  // Cargar puestos
  puestoSelect.innerHTML = puestos
    .map(p => `<option value="${p.id}">${p.Nombre}</option>`)
    .join("");

  modal.style.display = "flex";     
  overlay.style.display = "block";

  cancelarBtn.onclick = () => {
    modal.style.display = "none";
    overlay.style.display = "none";
  };

  form.onsubmit = async (e) => {
    e.preventDefault();

    const nuevoDoc = insertDocInput.value.trim();
    const nuevoNombre = insertNombreInput.value.trim();
    const nuevoIdPuesto = parseInt(puestoSelect.value);

    if (!nuevoDoc || !nuevoNombre || isNaN(nuevoIdPuesto)) {
      mostrarNotificacion("Todos los campos son obligatorios.", "error");

      insertDocInput.classList.toggle("input-error", !nuevoDoc);
      insertNombreInput.classList.toggle("input-error", !nuevoNombre);
      puestoSelect.classList.toggle("input-error", isNaN(nuevoIdPuesto));

      return;
    }

    // Quitar errores visuales si todo está bien
    insertDocInput.classList.remove("input-error");
    insertNombreInput.classList.remove("input-error");
    puestoSelect.classList.remove("input-error");

    try {
      const res = await fetch("/empleados", {
        method: "POST",
         headers: { "Content-Type": "application/json",
                    'X-User-Id': sessionStorage.getItem('userId'),
                    'X-User-IP': sessionStorage.getItem('userIP')
         },
        body: JSON.stringify({
          ValorDocumentoIdentidad: nuevoDoc,
          Nombre: nuevoNombre,
          IdPuesto: nuevoIdPuesto
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al insertar empleado.");
      }

      mostrarNotificacion("Empleado insertado correctamente.", "success");
      modal.style.display = "none";
      overlay.style.display = "none";
      cargarEmpleados();
    } catch (err) {
      console.error(err);
      mostrarNotificacion(err.message, "error");
    }
  };
}





  // Acciones por fila (usando delegación de eventos)
  document.getElementById("empleadosTable").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-accion");
    if (!btn) return; // si no clickeó un botón, salir

    const id = btn.dataset.id;

    if (btn.classList.contains("actualizar")) {
      const emp = empleados.find(e => e.DocumentoIdentidad == id);
    
      if (!emp) return alert("Empleado NO fue encontrado.");

      const puestos = await obtenerPuestos();
      if (puestos.length === 0) return alert("No hay puestos disponibles.");

      // Mostrar modal con datos precargados
      mostrarModalActualizar(emp, puestos);
    }

 
    else if (btn.classList.contains("borrar")) {
      const confirmado = await mostrarConfirmacion("¿Seguro que desea eliminar este empleado?");
      if (!confirmado) return;
      try {
        const res = await fetch(`/empleados/${id}`, 
          { method: "DELETE",
            headers: {
        "Content-Type": "application/json",
        "X-User-Id": sessionStorage.getItem('userId'),
        "X-User-IP": sessionStorage.getItem('userIP')
      }
           });
        if (!res.ok) throw new Error("Error al eliminar empleado");
        mostrarNotificacion("Empleado eliminado correctamente.", "success");
        cargarEmpleados();
      } catch (err) {
        console.error(err);
        mostrarNotificacion("No se pudo eliminar el empleado.", "error");
      }
    } 
    else if (btn.classList.contains("insertar-mov"))  {
      const emp = empleados.find(e => e.DocumentoIdentidad == id);
      if (!emp) {
        mostrarNotificacion("Empleado no encontrado", "error");
        return;
      }
      const movimientos = await obtenerMovimientos();
      if (movimientos.length === 0) return alert("No hay movimientos disponibles.");

      // Mostrar modal con datos precargados
      mostrarModalInsertarMovimiento(emp, movimientos);
  }
  else if (btn.classList.contains("listar-mov")) {
    const emp = empleados.find(e => e.DocumentoIdentidad === id);
    if (!emp) {
      mostrarNotificacion("Empleado no encontrado", "error");
      return;
    }

    try {
      const res = await fetch(`/empleados/${id}/movimientos`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al listar movimientos");

      // Mostrar datos básicos
      document.getElementById("listarMovDoc").textContent = emp.DocumentoIdentidad;
      document.getElementById("listarMovNombre").textContent = emp.Nombre;
      document.getElementById("listarMovSaldo").textContent = emp.SaldoVacaciones.toFixed(2);

      // Cargar tabla
      const tbody = document.querySelector("#tablaMovimientos tbody");
      tbody.innerHTML = "";

      data.movimientos.forEach(mov => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${new Date(mov.Fecha).toLocaleString()}</td>
          <td>${mov.TipoMovimiento}</td>
          <td>${mov.Monto.toFixed(2)}</td>
          <td>${mov.NuevoSaldo.toFixed(2)}</td>
          <td>${mov.RegistradoPor || "N/A"}</td>
          <td>${mov.PostInIP}</td>
          <td>${new Date(mov.PostTime).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
      });

      // Mostrar modal
      const modal = document.getElementById("modalListarMov");
      const overlay = document.getElementById("modalOverlay");
      modal.style.display = "block";
      overlay.style.display = "block";


      // Asignar botón para cerrar
      document.getElementById("btnCerrarListarMov").onclick = () => {
        modal.style.display = "none";
        overlay.style.display = "none";
      };

      // Redirigir a insertar movimiento
      document.getElementById("btnInsertarDesdeLista").onclick = async () => {
        modal.style.display = "none";
        const movimientos = await obtenerMovimientos();
        mostrarModalInsertarMovimiento(emp, movimientos);
      };

    } catch (err) {
      console.error("Error:", err);
      mostrarNotificacion("No se pudieron cargar los movimientos", "error");
    }
  }

  });
  
  
// Mostrar modal para actualizar empleado
function mostrarModalActualizar(emp, puestos) {
  const modal = document.getElementById("modalActualizar");
  const overlay = document.getElementById("modalOverlay");
  const form = document.getElementById("formActualizar");

  const docInput = document.getElementById("docInput");
  const nombreInput = document.getElementById("nombreInput");
  const puestoSelect = document.getElementById("puestoSelect");
  const cancelarBtn = document.getElementById("cancelarBtn");

  // Cargar datos actuales
  docInput.value = emp.DocumentoIdentidad;
  nombreInput.value = emp.Nombre;
  puestoSelect.innerHTML = puestos
    .map(p => `<option value="${p.id}" ${p.Nombre === emp.NombrePuesto ? "selected" : ""}>${p.Nombre}</option>`)
    .join("");

  // Mostrar
  modal.style.display = "block";
  overlay.style.display = "block";

  cancelarBtn.onclick = () => {
    modal.style.display = "none";
    overlay.style.display = "none";
  };

  form.onsubmit = async (e) => {
    e.preventDefault();

    const nuevoDoc = docInput.value.trim();
    const nuevoNombre = nombreInput.value.trim();
    const nuevoIdPuesto = parseInt(puestoSelect.value);

    const sinCambios =
      nuevoDoc === emp.DocumentoIdentidad &&
      nuevoNombre === emp.Nombre &&
      nuevoIdPuesto === emp.IdPuesto;

    if (sinCambios) {
      mostrarNotificacion("No se realizaron cambios.", "error");
      modal.style.display = "none";
      overlay.style.display = "none";
      return;
    }

    try {

      const res = await fetch(`/empleados/${emp.DocumentoIdentidad}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json",
                    'X-User-Id': sessionStorage.getItem('userId'),
                    'X-User-IP': sessionStorage.getItem('userIP')
         },
        body: JSON.stringify({
          valorDocumentoIdentidad: nuevoDoc,
          nombre: nuevoNombre,
          puesto: nuevoIdPuesto
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error desconocido");
      }

      mostrarNotificacion("Empleado actualizado correctamente.", "success");
      modal.style.display = "none";
      overlay.style.display = "none";
      cargarEmpleados();
    } catch (err) {
      console.error(err);
      mostrarNotificacion("No se pudo actualizar el empleado: " + err.message, "error");
    }
  };
}
  

// Mostrar modal para insertar movimiento
async function mostrarModalInsertarMovimiento(emp, movimientos) {
  const modal = document.getElementById("modalInsertarMov");
  const overlay = document.getElementById("modalOverlay");
  const tipoMovSelect = document.getElementById("tipoMovSelect");
  const movDoc = document.getElementById("movDoc");
  const movNombre = document.getElementById("movNombre");
  const movSaldo = document.getElementById("movSaldo");
  const form = document.getElementById("formInsertarMov");
  const montoInput = document.getElementById("montoInput");
  const cancelarBtn = document.getElementById("cancelarInsertarMov");

  // Mostrar datos del empleado
  movDoc.textContent = emp.DocumentoIdentidad;
  movNombre.textContent = emp.Nombre;
  movSaldo.textContent = emp.SaldoVacaciones.toFixed(2);

  // Cargar tipos de movimiento al select
  tipoMovSelect.innerHTML = movimientos.map(t =>
    `<option value="${t.id}">${t.Nombre}</option>`
  ).join("");

  // Mostrar modal
  modal.style.display = "block";
  overlay.style.display = "block";

  cancelarBtn.onclick = () => {
    modal.style.display = "none";
    overlay.style.display = "none";
    form.reset();
  };

  form.onsubmit = async (e) => {
    e.preventDefault();

    const idTipoMovimiento = parseInt(tipoMovSelect.value);
    const valorDocumentoIdentidad = emp.DocumentoIdentidad;
    const monto = parseFloat(montoInput.value);

    if (isNaN(monto) || monto <= 0) {
      mostrarNotificacion("Ingrese un monto válido mayor a 0", "error");
      return;
    }
    
    // Buscar tipo de movimiento
    const movimiento = movimientos.find(m => m.id === idTipoMovimiento);
    if (!movimiento) {
      mostrarNotificacion("Tipo de movimiento inválido", "error");
      return;
    }


    // Enviar al backend
    try {
      const now = new Date();
      const payload = {
        valorDocumentoIdentidad,
        idTipoMovimiento,
        fecha: now.toISOString(),
        monto,
        idPostByUser: 1, // ⚠️ temporal: ajustar según usuario logueado
        postInIP: '127.0.0.1', // ⚠️ temporal o detectado en backend
        postTime: now.toISOString()
      };

      const res = await fetch(`/empleados/${emp.DocumentoIdentidad}/movimientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json",           
        "X-User-Id": sessionStorage.getItem('userId'),
        "X-User-IP": sessionStorage.getItem('userIP')
         },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error desconocido");
      }

      mostrarNotificacion("Movimiento insertado correctamente", "success");
      modal.style.display = "none";
      overlay.style.display = "none";
      form.reset();
      cargarEmpleados(); // refrescar tabla
    } catch (err) {
      console.error("Error al insertar movimiento:", err);
      mostrarNotificacion(err.message, "error");
    }
  };
}



// Función de cerrar sesión
document.getElementById('btnCerrarSesion').addEventListener('click', async () => {
  const userId = sessionStorage.getItem('userId');
  const userIP = sessionStorage.getItem('userIP');
  if (!userId) {
    // Si no hay userId, simplemente limpiar y redirigir
    sessionStorage.clear();
    window.location.href = 'login.html';  
    return;
  }

  try {
    const res = await fetch('/empleados/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        'X-User-IP': userIP
      },
      body: JSON.stringify({})  // aunque no pases cuerpo, puedes enviar {} o nada
    });

    if (!res.ok) throw new Error('Error al cerrar sesión');

    // Limpia almacenamiento local
    sessionStorage.clear();

    // Redirige a login
    window.location.href = 'login.html';

  } catch (err) {
    console.error('Error al hacer logout:', err);
    alert('No se pudo cerrar sesión. Por favor, intente nuevamente.');
  }
});

  


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

// Función para pedir la confirmación de borrar un empleado
function mostrarConfirmacion(mensaje) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalConfirm");
    const mensajeElem = document.getElementById("modalConfirmMensaje");
    const btnYes = document.getElementById("modalConfirmBtnYes");
    const btnNo = document.getElementById("modalConfirmBtnNo");

    mensajeElem.textContent = mensaje;
    modal.style.display = "block";

    const cerrar = () => {
      modal.style.display = "none";
      btnYes.onclick = null;
      btnNo.onclick = null;
    };

    btnYes.onclick = () => {
      cerrar();
      resolve(true);
    };

    btnNo.onclick = () => {
      cerrar();
      resolve(false);
    };
  });
}


// Cerrar modal al hacer clic fuera de su contenido
document.addEventListener("click", function (event) {
  const modal = document.getElementById("modalListarMov");
  const overlay = document.getElementById("modalOverlay");

  if (modal.style.display === "block" && !modal.contains(event.target) && event.target !== overlay) {
    modal.style.display = "none";
    overlay.style.display = "none";
  }
});


  



// Cargar empleados al inicio
  cargarEmpleados();
});
   