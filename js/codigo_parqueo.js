
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

const elementos = {
    input_usuario_vehiculo: document.getElementById("usuario"),
    input_placa: document.getElementById("placa"),
    input_marca_vehiculo: document.getElementById("marca"),
    input_tipo_vehiculo: document.getElementById("tipo"),
    select_del_operador: document.getElementById("empleados"),
    input_fecha_entrada: document.getElementById("fecha"),
    boton_agregar_vehiculo: document.getElementById("botonsito"),


    //SALIDA

    input_operador_salida: document.getElementById("operador_salida"),
    input_placa_salida: document.getElementById("placa_salida"),
    input_hora_salida: document.getElementById("hora_salida"),


    //realizar cobro

    boton_agregar_salida: document.getElementById("botonsito-salida"),

    


}



document.addEventListener("DOMContentLoaded", ()=>{
    //Esto es para cargar las funciones que tengo 

    cargar_empleados();

    cargar_empleados_salida();

    select_placas_salida();


})


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
    const select = elementos.select_del_operador;
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

elementos.boton_agregar_vehiculo.addEventListener("click", ()=>{

    const usuario = String(elementos.input_usuario_vehiculo.value.trim().toUpperCase());
    const placa = String(elementos.input_placa.value.trim().toUpperCase());
    const marca = String(elementos.input_marca_vehiculo.value.trim().toUpperCase());
    const tipo_v = String(elementos.input_tipo_vehiculo.value.trim().toUpperCase());
    const id_operador = parseInt(elementos.select_del_operador.value.trim());
    const fecha_entrada = String(elementos.input_fecha_entrada.value.trim().toUpperCase());
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
    alert(`✅ Vehiculo registrado con exito por ${operador.name}`);

})


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

elementos.boton_agregar_salida.addEventListener("click",()=>{

    const placa_salida = document.getElementById("placa_salida").value;
    const hora_salida =document.getElementById("hora_salida").value;
    const operador_salida_id = parseInt(document.getElementById("operador_salida").value);

    console.log(placa_salida);
    console.log(hora_salida);
    console.log(operador_salida_id);

    if(!placa_salida || !hora_salida || !operador_salida_id)






})


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
    const select = elementos.input_operador_salida;
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


function select_placas_salida(){

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













/* localStorage.clear(); */