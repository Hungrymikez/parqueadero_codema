
const datos = {
    vehiculos: JSON.parse(localStorage.getItem('vehiculos')) || [],
    historial: JSON.parse(localStorage.getItem('historial')) || [],
    operadores: [],
    lista_operadores_salida: [],
}

const precios = {
    carro: 3000,
    moto: 1500,
    bicicleta: 500
};

/* document.addEventListener("DOMContentLoaded", ()=>{
    //Esto es para cargar las funciones que tengo 

    cargar_empleados();

    cargar_empleados_salida();

    select_placas_salida();



}) */


    document.addEventListener('DOMContentLoaded', async function() {
        // Cargar operadores desde API
        
        // Determinar qué página está activa
        const path = window.location.pathname.split('/').pop();
        
        if (path === 'ingreso_vehiculo.html' || path === '') {
            // Vista de entrada
            cargar_empleados();
            actualizar_tabla_carros();
            document.getElementById('botonsito').addEventListener('click', registrar_vehiculo);
        } 
        else if (path === 'salida_vehiculo.html') {
            // Vista de salida
            cargar_empleados_salida();
            select_placas_salida();
            document.getElementById('boton_calcular').addEventListener('click', calcular_cobro);
            document.getElementById('confirmar_salida').addEventListener('click', confirmar_salida);
        } 
        else if (path === 'historial.html') {
            // Vista de historial
            actualizar_tabla_historial();
/*             document.getElementById('filtro-placa').addEventListener('input', filtrarHistorial);
            document.getElementById('filtro-tipo').addEventListener('change', filtrarHistorial); */
        }
    });






const input_usuario_vehiculo= document.getElementById("usuario");
const input_placa= document.getElementById("placa");
const input_marca_vehiculo= document.getElementById("marca");
const input_tipo_vehiculo= document.getElementById("tipo");
const select_del_operador= document.getElementById("empleados");
const input_fecha_entrada= document.getElementById("fecha");
/* const boton_agregar_vehiculo= document.getElementById("botonsito");
 */

//SALIDA

const input_operador_salida= document.getElementById("operador_salida");
const input_placa_salida= document.getElementById("placa_salida");
const input_hora_salida= document.getElementById("hora_salida");


//realizar cobro

const agregar_salida = document.getElementById("salida");

const boton_confirmar_salida= document.getElementById("confirmar-salida");






//FUNCIONES DEL CONSUMO DE LA API DE EMPLEADOS

function cargar_empleados(){

    fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => response.json())
        .then(data => {
            datos.operadores = data;
            actualizar_select_operador();
        })
        .catch(error => console.error('Error al cargar empleados:', error));

    
}

function actualizar_select_operador(){
    const select = select_del_operador;
    select.innerHTML = '';  // Limpiar el select

    // Crear opción por defecto
    const option_defecto = document.createElement("option");
    option_defecto.value = '';
    option_defecto.textContent= 'Seleccione por favor el operador'
    option_defecto.selected = true; 
    option_defecto.disabled = true;
    select.appendChild(option_defecto);


    //Llenar con los meseros de la API
    datos.operadores.forEach(empleado =>{
        const option = document.createElement('option');
        option.value = empleado.id;
        option.textContent = empleado.name;
        select.appendChild(option);
    });

}

function registrar_vehiculo(){

    const usuario = String(input_usuario_vehiculo.value.trim().toUpperCase());
    const placa = String(input_placa.value.trim().toUpperCase());
    const marca = String(input_marca_vehiculo.value.trim().toUpperCase());
    const tipo_v = String(input_tipo_vehiculo.value.trim().toUpperCase());
    const id_operador = parseInt(select_del_operador.value.trim());
    const fecha_entrada = input_fecha_entrada.value.trim().toUpperCase();
    console.log(usuario);
    console.log(placa);
    console.log(marca);
    console.log(tipo_v);
    console.log(id_operador);
    console.log(fecha_entrada);


    if(!usuario || !placa || !marca || !tipo_v || !id_operador || !fecha_entrada){
        alert(" ⚠️ Mijo complete todo ese visaje");
        return;
    }

        // Verificar si la placa ya está registrada (sin salida)
        const existe = datos.vehiculos.some(v => v.placa === placa && !v.horaSalida);
        if (existe) {
            alert('🚨 Esta placa ya está en el parqueadero');
            return;
        }
    

    const operador = datos.operadores.find(op=> op.id === id_operador);
    if(!operador){
        alert("Operador no valido");
        return;

    }


    //AGREGAR VEHICULO CON EL EMPLEADO DE LA API

    datos.vehiculos.push({
        usuario,
        placa,
        marca,
        tipo_v,
        fecha_entrada: new Date(fecha_entrada).toISOString(),
        fecha_salida: null,
        total_pagado: 0,
        operador: {
            id: operador.id,
            nombre: operador.name
        }
    });




    //GUARDAR EN EL LOCALSTORAGE MI OBJETO CONVIRTIENDOLO A STRING PARA QUE LO LEA COMO UN STRING

    localStorage.setItem('vehiculos', JSON.stringify(datos.vehiculos));
    //AQUI VA LA FUNCION DE LA  CREACION DE LA TABLA

    imprimir_tabla();
    document.getElementById('placa').value = '';
    alert(`✅ Vehiculo registrado con exito por ${operador.name}`);


}


function imprimir_tabla(){

    const tabla = document.getElementById("tabla_carros_registrados");
    tabla.innerHTML = "";

    datos.vehiculos.filter(v => !v.fecha_salida).forEach(vehiculo =>{

        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${vehiculo.placa}</td>
        <td>${vehiculo.marca}</td>
        <td>${vehiculo.tipo_v}</td>
        <td>${new Date(vehiculo.fecha_entrada).toLocaleString()}</td>
        <td><button class="btn btn-sm btn-danger" disabled>En parqueadero</button></td>
    
        `;
        tabla.appendChild(tr);
    })
}


//REALIZAR LOS COBROS


function calcular_cobro(){

    const placa_salida = document.getElementById("placa_salida").value;
    const hora_salida =document.getElementById("hora_salida").value.trim().toUpperCase();
    const operador_salida_id = parseInt(document.getElementById("operador_salida").value);

    console.log(placa_salida);
    console.log(hora_salida);
    console.log(operador_salida_id);

    if(!placa_salida || !hora_salida || !operador_salida_id){
        alert('⚠️ Complete todos los campos: placa, hora salida y operador');
        return;
    }
    

    //BUSCO EL CARRITO 
    const vehiculo = datos.vehiculos.find(v => v.placa === placa_salida  && !v.fecha_salida);
    if(!vehiculo){
        alert('🚨 Mi hermano el vehiculo no encontrado o ya fue retirado');
        return;
    }

    //buscar o validar el operador, PUes que funcione  el op es el operador dentro del arreglo de objetos de la lista de operadores
    const buscar_operador = datos.lista_operadores_salida.find(op => op.id === operador_salida_id);
    if (!buscar_operador){
        alert('🚨 Mi hermano operador no valido');
        return;
    }


    // aqui calculo la plata hecha y el tiempo estimado


    let entrada = new Date(vehiculo.fecha_entrada);
    let salida = new Date(hora_salida);

/*     console.log("Tipo de entrada:", typeof entrada, entrada);
console.log("Tipo de salida:", typeof salida, salida);
console.log("Fecha convertida:", new Date(document.getElementById("hora_salida").value));
 */



/*     if (salida <= entrada) {
        alert('🚨 La hora de salida debe ser posterior a la hora de entrada');
        return;
    } */

    //diferencia de horas (redondedo hacia ariba ejemplo si tengo 2.1 me lo pone a 3 horas )
    let diferencia_ms = salida-entrada;
    
    
    let diferencia_horas = Math.ceil((diferencia_ms)/(1000 * 60 * 60));
    let total_pagar = diferencia_horas * precios[vehiculo.tipo_v.toLowerCase()];




    document.getElementById('detalle-placa').textContent = vehiculo.placa;
    document.getElementById('detalle-tipo').textContent = vehiculo.tipo_v;
    document.getElementById('detalle-operador-entrada').textContent = vehiculo.operador.nombre;
    document.getElementById('detalle-operador-salida').textContent = buscar_operador.name;
    document.getElementById('detalle-entrada').textContent = entrada.toLocaleString();
    document.getElementById('detalle-salida').textContent = salida.toLocaleString();

    document.getElementById('tiempo-estadia').textContent = diferencia_horas;
    document.getElementById('total-pagar').textContent = total_pagar.toLocaleString('es-CO', {style: 'currency', currency: 'COP'});
    document.getElementById('resultado-pago').style.display = 'block';

    vehiculo_temporal ={
        fecha_salida: salida.toISOString(),
        total_pagado: total_pagar,
        operador_salida: {
            id: buscar_operador.id,
            nombre: buscar_operador.name
        }
    };
}




function confirmar_salida(){


    const placa_salida = document.getElementById('placa_salida').value;
    const vehiculo = datos.vehiculos.find(v => v.placa === placa_salida && !v.fecha_salida);

    if (!vehiculo || !vehiculo_temporal){
        alert('Error al procesar la salida');
        return;
    }

    //actualizar los datos del vehiculo

    vehiculo.fecha_salida = vehiculo_temporal.fecha_salida;
    vehiculo.total_pagado = vehiculo_temporal.total_pagado;
    vehiculo.operador_salida = vehiculo_temporal.operador_salida;



    //ahora mover a el historial para poder guardarlo en la tabla del historial 
    //este es un ejemplo del operado que me encontre por ahi 
/* 
    datos.historial.push({
        ...vehiculo,          // Copia todas las propiedades de vehiculo
        operadorEntrada: vehiculo.operador,
        operadorSalida: vehiculo.operadorSalida
    }); */
    datos.historial.push({
        usuario_historial: vehiculo.usuario,
        placa_historial: vehiculo.placa_salida,
        tipo_historial: vehiculo.tipo_v,
        fecha_entrada_historial: vehiculo.fecha_entrada,
        fecha_salida_historial: vehiculo.fecha_salida,
        operador_historial: vehiculo.operador,

        operador_entrada_his: vehiculo.operador,
        operador_salida_his: vehiculo.operador_salida
        
        
    });

    //Metodo para borrar el historial lo que se cancelo 
    datos.vehiculos = datos.vehiculos.filter(v =>v.placa !== placa_salida || v.fecha_salida);
    //Actualizo el local storage
    localStorage.setItem('vehiculos', JSON.stringify(datos.vehiculos));
    localStorage.setItem('historial',JSON.stringify(datos.historial));

    //Resetear el UI
    document.getElementById('placa_salida').value = '';
    document.getElementById('hora_salida').value = '';
    document.getElementById('resultado-pago').style.display = 'none';


    alert(`Salida hecha por ${vehiculo.operador_salida.nombre}  Total cobrado : ${vehiculo.total_pagado.toLocaleString('es-CO')}`);



    select_placas_salida();
    actualizar_tabla_historial();

}


/* datos.historial.push({
    // Copiamos MANUALMENTE cada propiedad de vehiculo
    placa: vehiculo.placa,
    tipo: vehiculo.tipo,
    horaEntrada: vehiculo.horaEntrada,
    horaSalida: vehiculo.horaSalida,
    totalPagado: vehiculo.totalPagado,
    operador: vehiculo.operador, // Propiedad original (innecesaria en historial)
    
    // Añadimos los nuevos campos
    operadorEntrada: vehiculo.operador,
    operadorSalida: vehiculo.operadorSalida
}); */






//Otra vez la api de los empleados pq no se como hacer mas facil el comsumo de la api para todo
function cargar_empleados_salida(){

    fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => response.json())
        .then(data1 => {
            datos.lista_operadores_salida = data1;
            actualizar_select_operador_salida();
        })
        .catch(error => console.error('Error al cargar empleados:', error));

    
}

function actualizar_select_operador_salida(){
    const select = input_operador_salida;
    select.innerHTML = '';  // Limpiar el select

    // Crear opción por defecto
    const option_defecto = document.createElement("option");
    option_defecto.value = '';
    option_defecto.textContent= 'Seleccione por favor el operador'
    option_defecto.selected = true; 
    option_defecto.disabled = true;
    select.appendChild(option_defecto);


    //Llenar con los meseros de la API
    datos.lista_operadores_salida.forEach(operador =>{
        const option = document.createElement('option');
        option.value = operador.id;
        option.textContent = operador.name;
        select.appendChild(option);
    });

}


function select_placas_salida(){    // Cargar vehículos en select (para salida)


    const select= document.getElementById("placa_salida");
    select.innerHTML = '<option value="">Seleccione placa del automotor </option>';
    datos.vehiculos
        .filter(v => !v.fecha_salida)
        .forEach(vehiculo =>{
            
            const option = document.createElement("option");

            option.value = vehiculo.placa;
            option.textContent = `${vehiculo.placa} (${vehiculo.tipo_v})   ${new Date(vehiculo.fecha_entrada).toLocaleString()}`;
            select.appendChild(option);
        });
}

// Actualizar tabla de vehículos activos
function actualizar_tabla_carros(){

    const tabla = document.getElementById("tabla_carros_registrados");
    tabla.innerHTML = "";

    datos.vehiculos.filter(v => !v.fecha_salida).forEach(vehiculo =>{

        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${vehiculo.placa}</td>
        <td>${vehiculo.marca}</td>
        <td>${vehiculo.tipo_v}</td>
        <td>${new Date(vehiculo.fecha_entrada).toLocaleString()}</td>
        <td>${vehiculo.operador.nombre}</td>
        <td><span class="badge bg-success">En parqueadero</span></td>    
        `;
        tabla.appendChild(tr);
    })


}


function actualizar_tabla_historial(){
    const tabla_1 = document.getElementById("tabla_carros_historial");
    tabla_1.innerHTML= '';
    
    datos.historial
    .filter(registro => {
        const placa_valida = registro.placa_historial.toLowerCase().includes(filtro_placa.toLowerCase());
        const tipo_valido = filtro_tipo === '' || registro.tipo_v === filtro_tipo;
        return placa_valida && tipo_valido;
    })
    .forEach(registro =>{
        const fila = document.createElement("tr");
        fila.innerHTML= `
        <td>${registro.usuario_historial}</td>
        <td>${registro.placa_historial}</td>
        <td>${registro.tipo_historial}</td>
        <td>${new Date(registro.fecha_entrada_historial).toLocaleString()}</td>
        <td>${new Date(registro.fecha_salida_historial).toLocaleString()}</td>
        <td>${registro.operador_entrada_his}</td>
        <td>${registro.operador_salida_his}</td>
        <td>${registro.total_pagado.toLocaleString('es-CO')}</td>
        
        `;
        tabla_1.appendChild(fila);
    })
}


function filtar_historial(){

    const filtro_placa = document.getElementById("filtro_placa").value;
    const filtro_tipo = document.getElementById("filtro_placa").value;

    actualizarTablaHistorial(filtro_placa, filtro_tipo);



}









/* localStorage.clear(); */