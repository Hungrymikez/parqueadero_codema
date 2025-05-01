// CODIGO

/**********************************************
 * 1. VARIABLES GLOBALES Y CONSTANTES
 **********************************************/
const datoss = {
    vehiculos: JSON.parse(localStorage.getItem('vehiculos')) || [],
    historial: JSON.parse(localStorage.getItem('historial')) || [],
    operadores: [] // Aquí almacenaremos los operadores de la API
};

const tarifas = {
    carro: 3000,
    moto: 1500,
    bicicleta: 500
};

// Elementos del DOM (actualizados con operador)
const elementoss = {
    // ... (los anteriores)
    selectOperador: document.getElementById('operador') // Añade este select en tu HTML
};

/**********************************************
 * 2. INICIALIZACIÓN CON API
 **********************************************/
document.addEventListener('DOMContentLoaded', async function() {
    await cargarOperadores(); // Carga los operadores desde la API
    
    // Resto de inicialización
    const path = window.location.pathname.split('/').pop();
    if (path === 'index.html' || path === '') {
        actualizarTablaVehiculos();
        document.getElementById('btn-registrar').addEventListener('click', registrarEntrada);
    } 
    // ... (resto del código de inicialización)
});

/*** 2.1. CARGAR OPERADORES DESDE API ***/
async function cargarOperadores() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) throw new Error('Error al cargar operadores');
        
        datos.operadores = await response.json();
        actualizarSelectOperadores();
    } catch (error) {
        console.error('Error:', error);
        alert('⚠️ No se pudieron cargar los operadores. Usando datos locales.');
    }
}

/*** 2.2. ACTUALIZAR SELECT DE OPERADORES ***/
function actualizarSelectOperadores() {
    const select = elementos.selectOperador;
    select.innerHTML = '<option value="">Seleccione operador</option>';
    
    datos.operadores.forEach(operador => {
        const option = document.createElement('option');
        option.value = operador.id;
        option.textContent = operador.name;
        select.appendChild(option);
    });
}

/**********************************************
 * 3. FUNCIONES MODIFICADAS CON OPERADOR
 **********************************************/

/*** 3.1. REGISTRAR ENTRADA CON OPERADOR ***/
function registrarEntrada() {
    const placa = document.getElementById('placa').value.trim().toUpperCase();
    const tipo = document.getElementById('tipo').value;
    const horaEntrada = document.getElementById('hora-entrada').value;
    const operadorId = parseInt(elementos.selectOperador.value);

    if (!placa || !horaEntrada || !operadorId) {
        alert('⚠️ Complete todos los campos, incluido el operador');
        return;
    }

    const operador = datos.operadores.find(op => op.id === operadorId);
    if (!operador) {
        alert('Operador no válido');
        return;
    }

    // Agregar vehículo con operador
    datos.vehiculos.push({
        placa,
        tipo,
        horaEntrada: new Date(horaEntrada).toISOString(),
        horaSalida: null,
        totalPagado: 0,
        operador: { // Guardamos info del operador
            id: operador.id,
            nombre: operador.name
        }
    });

    localStorage.setItem('vehiculos', JSON.stringify(datos.vehiculos));
    actualizarTablaVehiculos();
    alert(`✅ Vehículo registrado por ${operador.name}`);
}

/*** 3.2. ACTUALIZAR TABLA VEHÍCULOS CON OPERADOR ***/
function actualizarTablaVehiculos() {
    const tbody = document.getElementById('tabla-vehiculos');
    tbody.innerHTML = '';

    datos.vehiculos.filter(v => !v.horaSalida).forEach(vehiculo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${vehiculo.placa}</td>
            <td>${vehiculo.tipo}</td>
            <td>${new Date(vehiculo.horaEntrada).toLocaleString()}</td>
            <td>${vehiculo.operador?.nombre || 'N/A'}</td>
            <td><button class="btn btn-sm btn-danger" disabled>En parqueadero</button></td>
        `;
        tbody.appendChild(tr);
    });
}

/*** 3.3. ACTUALIZAR TABLA HISTORIAL CON OPERADOR ***/
function actualizarTablaHistorial() {
    const tbody = document.getElementById('tabla-historial');
    tbody.innerHTML = '';

    datos.historial.forEach(registro => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${registro.placa}</td>
            <td>${registro.tipo}</td>
            <td>${registro.operador?.nombre || 'N/A'}</td>
            <td>${new Date(registro.horaEntrada).toLocaleString()}</td>
            <td>${registro.horaSalida ? new Date(registro.horaSalida).toLocaleString() : '--'}</td>
            <td>$${registro.totalPagado.toLocaleString('es-CO')}</td>
        `;
        tbody.appendChild(tr);
    });
}



//COBRAR
/**********************************************
 * 4. FUNCIONES DE COBRO Y SALIDA
 **********************************************/

/*** 4.1. CALCULAR COBRO POR TIEMPO ***/
function calcularCobro() {
    const placa = document.getElementById('placa-salida').value;
    const horaSalida = document.getElementById('hora-salida').value;
    const operadorId = parseInt(document.getElementById('operador-salida').value);

    // Validaciones
    if (!placa || !horaSalida || !operadorId) {
        alert('⚠️ Complete todos los campos: placa, hora salida y operador');
        return;
    }

    // Buscar vehículo
    const vehiculo = datos.vehiculos.find(v => v.placa === placa && !v.horaSalida);
    if (!vehiculo) {
        alert('🚨 Vehículo no encontrado o ya fue retirado');
        return;
    }

    // Validar operador
    const operador = datos.operadores.find(op => op.id === operadorId);
    if (!operador) {
        alert('Operador no válido');
        return;
    }

    // Calcular tiempo y costo
    const entrada = new Date(vehiculo.horaEntrada);
    const salida = new Date(horaSalida);
    
    // Diferencia en horas (redondeo hacia arriba)
    const diffHoras = Math.ceil((salida - entrada) / (1000 * 60 * 60)); 
    const totalPagar = diffHoras * tarifas[vehiculo.tipo];

    // Mostrar resultados
    document.getElementById('detalle-placa').textContent = vehiculo.placa;
    document.getElementById('detalle-tipo').textContent = vehiculo.tipo;
    document.getElementById('detalle-operador').textContent = operador.name;
    document.getElementById('tiempo-estadia').textContent = diffHoras;
    document.getElementById('total-pagar').textContent = totalPagar.toLocaleString('es-CO');
    document.getElementById('resultado-pago').style.display = 'block';

    // Guardar datos temporales
    vehiculo._temp = {
        horaSalida: salida.toISOString(),
        totalPagado: totalPagar,
        operadorSalida: {
            id: operador.id,
            nombre: operador.name
        }
    };
}

/*** 4.2. REGISTRAR SALIDA DEFINITIVA ***/
function confirmarSalida() {
    const placa = document.getElementById('placa-salida').value;
    const vehiculo = datos.vehiculos.find(v => v.placa === placa && !v.horaSalida);

    if (!vehiculo || !vehiculo._temp) {
        alert('Error al procesar la salida');
        return;
    }

    // Actualizar vehículo
    vehiculo.horaSalida = vehiculo._temp.horaSalida;
    vehiculo.totalPagado = vehiculo._temp.totalPagado;
    vehiculo.operadorSalida = vehiculo._temp.operadorSalida;

    // Mover al historial
    datos.historial.push({
        ...vehiculo,
        operadorEntrada: vehiculo.operador, // Guardamos ambos operadores
        operadorSalida: vehiculo.operadorSalida
    });

    // Eliminar de vehículos activos
    datos.vehiculos = datos.vehiculos.filter(v => v.placa !== placa || v.horaSalida);

    // Actualizar storage
    localStorage.setItem('vehiculos', JSON.stringify(datos.vehiculos));
    localStorage.setItem('historial', JSON.stringify(datos.historial));

    // Resetear UI
    document.getElementById('placa-salida').value = '';
    document.getElementById('hora-salida').value = '';
    document.getElementById('resultado-pago').style.display = 'none';
    
    alert(`✅ Salida registrada por ${vehiculo.operadorSalida.nombre}\nTotal cobrado: $${vehiculo.totalPagado.toLocaleString('es-CO')}`);
    
    // Actualizar listados
    cargarVehiculosEnParqueadero();
    if (window.location.pathname.includes('historial')) {
        actualizarTablaHistorial();
    }
}

// Cargar vehículos en select (para salida)
function cargarSelectVehiculos() {
    const select = document.getElementById('placa-salida');
    select.innerHTML = '<option value="">Seleccione vehículo</option>';
    
    datos.vehiculos
        .filter(v => !v.horaSalida)
        .forEach(vehiculo => {
            const option = document.createElement('option');
            option.value = vehiculo.placa;
            option.textContent = `${vehiculo.placa} (${vehiculo.tipo}) - ${new Date(vehiculo.horaEntrada).toLocaleString()}`;
            select.appendChild(option);
        });
}


// Actualizar tabla de vehículos activos
function actualizarTablaVehiculos() {
    const tbody = document.getElementById('tabla-vehiculos');
    tbody.innerHTML = '';
    
    datos.vehiculos
        .filter(v => !v.horaSalida)
        .forEach(vehiculo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${vehiculo.placa}</td>
                <td>${vehiculo.tipo}</td>
                <td>${new Date(vehiculo.horaEntrada).toLocaleString()}</td>
                <td>${vehiculo.operador.nombre}</td>
                <td><span class="badge bg-success">En parqueadero</span></td>
            `;
            tbody.appendChild(tr);
        });
}

// Actualizar tabla de historial con filtros
function actualizarTablaHistorial(filtroPlaca = '', filtroTipo = '') {
    const tbody = document.getElementById('tabla-historial');
    tbody.innerHTML = '';
    
    datos.historial
        .filter(registro => {
            const cumplePlaca = registro.placa.toLowerCase().includes(filtroPlaca.toLowerCase());
            const cumpleTipo = filtroTipo === '' || registro.tipo === filtroTipo;
            return cumplePlaca && cumpleTipo;
        })
        .forEach(registro => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${registro.placa}</td>
                <td>${registro.tipo}</td>
                <td>${registro.operadorEntrada.nombre}</td>
                <td>${registro.operadorSalida.nombre}</td>
                <td>${new Date(registro.horaEntrada).toLocaleString()}</td>
                <td>${new Date(registro.horaSalida).toLocaleString()}</td>
                <td>$${registro.totalPagado.toLocaleString('es-CO')}</td>
            `;
            tbody.appendChild(tr);
        });
}

// Filtrar historial
function filtrarHistorial() {
    const filtroPlaca = document.getElementById('filtro-placa').value;
    const filtroTipo = document.getElementById('filtro-tipo').value;
    actualizarTablaHistorial(filtroPlaca, filtroTipo);
}