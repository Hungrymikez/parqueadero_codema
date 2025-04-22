

const elementos = {

    //Agrega un plato
    codigo_plato: document.getElementById("codigo_plato"),
    nombre_plato: document.getElementById("nombre_plato"),
    precio_plato: document.getElementById("precio_plato"),
    btn_agregar_plato: document.getElementById("btn_agregar_plato"),

    //REGISTRAR UNA MESA

    numero_mesa: document.getElementById("numero_mesa"),
    btn_registrar_mesa: document.getElementById("btn_registrar_mesa"),

    //Crear pedido
    mesa_pedido: document.getElementById("mesa_pedido"),
    plato_pedido: document.getElementById("plato_pedido"),
    mesero_pedido: document.getElementById("mesero_pedido"),
    cantidad_pedido: document.getElementById("cantidad_pedido"),
    btn_agregar_pedido: document.getElementById("btn_agregar_pedido"),



    //PAGAR MESA
    mesa_pagar: document.getElementById("mesa_pagar"),
    btn_pagar_mesa: document.getElementById("btn_pagar_mesa"),
    

    //Tablas
    tabla_cuentas: document.getElementById("tabla_cuentas"),
    tabla_platos: document.getElementById("tabla_platos"),
    tabla_meseros: document.getElementById("tabla_meseros") 

};

//DATOS ALMACENADOS EN LOCALSTORAGE

const datos = {
    platos: JSON.parse(localStorage.getItem('platos')) || [],
    mesas: JSON.parse(localStorage.getItem('mesas')) || [],
    meseros: JSON.parse(localStorage.getItem('meseros')) || [],
    empleados_api: []
};


//CARGAR LOS DATOS
// INICIALIZACION
/* Espera a que el HTML esté completamente cargado antes de ejecutar el código interno
Es como decir: "Cuando la página termine de cargar, haz esto..." */

document.addEventListener('DOMContentLoaded', ()=>{
    //Cargar empleados desde la API
    cargar_empleados();

    // Actualizar selects y tablas
    actualizar_selects();
    actualizar_tablas();
        
    // Asignar eventos
    asignar_eventos();
});

//ACA EMPIEZAN LAS FUNCIONES QUE SE NECESITAN


//CARGAR LOS EMPLEADOS DESDE LA API QUE TENGO DE USUARIOS
function cargar_empleados(){

    fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => response.json())
        .then(data => {
            datos.empleados_api = data;
            actualizar_select_meseros();
        })
        .catch(error => console.error('Error al cargar empleados:', error));

    
}

//ACTUALIZAR SELECTS

function actualizar_selects(){
    actualizar_select_mesas();
    actualizar_select_platos();
    actualizar_select_meseros();

}


//ACTUALIZAR SELECT DE LOS MESEROS

function actualizar_select_meseros(){
    const select = elementos.mesero_pedido;
    select.innerHTML = '';  // Limpiar el select


    // Crear opción por defecto
    const option_defecto = document.createElement("option");
    option_defecto.value = '';
    option_defecto.textContent= 'Seleccione por favor un mesero'
    option_defecto.selected = true; 
    option_defecto.disabled = true;
    select.appendChild(option_defecto);

    //Llenar con los meseros de la API
    datos.empleados_api.forEach(empleado =>{
        const option = document.createElement('option');
        option.value = empleado.id;
        option.textContent = empleado.name;
        select.appendChild(option);
    });

}

//actualizar select de las mesas

function actualizar_select_mesas(){
    elementos.mesa_pedido.innerHTML = '';
    elementos.mesa_pagar.innerHTML = '';

    //OPCION POR DEFECTO
    const option_defecto = document.createElement("option");
    option_defecto.value = '';
    option_defecto.textContent= 'Seleccione por favor una mesa'
    option_defecto.selected = true; 
    option_defecto.disabled = true;

    elementos.mesa_pedido.appendChild(option_defecto.cloneNode(true));
    elementos.mesa_pagar.appendChild(option_defecto.cloneNode(true));

    //LLenar con las mesas REGISTRADAS
    datos.mesas.forEach(mesa => {
        const option = document.createElement('option');
        option.value = mesa.numero;
        option.textContent = `Mesa ${mesa.numero}`;

        elementos.mesa_pedido.appendChild(option.cloneNode(true));
        elementos.mesa_pagar.appendChild(option);

    });


}

//    ACTUALIZAR SELECT DE PLATOS 


function actualizar_select_platos(){
    const select = elementos.plato_pedido;
    select.innerHTML= '';

    //OPCION POR DEFECTO

    const option_defecto = document.createElement('option');
    option_defecto.value = '';
    option_defecto.textContent = 'Seleccione por favor un plato '; 
    option_defecto.selected = true ; 
    option_defecto.disabled = true ; 
    select.appendChild(option_defecto);


    //LLENAR CON LOS PLATOS DEL MENU
    datos.platos.forEach(plato => {
        const option = document.createElement("option");
        option.value = plato.codigo;
        option.textContent = `${plato.nombre} - $${plato.precio}`;
        select.appendChild(option);
    });
}

// FUNCIONESP PARA ACTUALIZAR LAS TABLAS

function actualizar_tablas(){
    
    // TABLA PARA PLATOS
    elementos.tabla_platos.innerHTML = '';
    datos.platos.forEach(plato => {
        const tr = document.createElement('tr');
        tr.innerHTML= `
        <td>${plato.codigo}</td>
        <td>${plato.nombre}</td>
        <td>${plato.precio}</td>  ` ;
        elementos.tabla_platos.appendChild(tr); 
    });

    //TABLA DE LOS MESEROS

    elementos.tabla_meseros.innerHTML = '';
    datos.meseros.forEach(mesero =>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${mesero.nombre}</td>
        <td>$${mesero.total}</td>
        <td>${mesero.pedidos}</td>
    `;
    elementos.tabla_meseros.appendChild(tr);

    })

    actualizar_tabla_cuentas();
}

function actualizar_tabla_cuentas(){
    elementos.tabla_cuentas.innerHTML = '';

    datos.mesas.forEach(mesa =>{

        //SE CONFIGURA SOLO MOSTRAR MESAS CON PEDIDOS

        if(mesa.pedidos.length === 0 ) return ; 

        const tr = document.createElement('tr');

        //COLUMNA MESA
        const td_mesa = document.createElement('td');
        td_mesa.textContent = `Mesa  ${mesa.numero}`;


        //COLUMNA DETALLE
        const td_detalle = document.createElement('td');
        const ul = document.createElement('ul');
        ul.className = 'list-unstyled';

        mesa.pedidos.forEach(pedido => {
            const plato = datos.platos.find(p => p.codigo === pedido.plato_codigo);
            const li = document.createElement('li');
            li.textContent = `${plato.nombre} X ${pedido.cantidad} - $${pedido.subtotal}`;
            ul.appendChild(li);
        });
        td_detalle.appendChild(ul);

        //COLUMNA TOTAL 
        
        const td_total = document.createElement('td');
        td_total.textContent = `$${mesa.total}`;
        td_total.className = 'fw-bold';

        // CREAR LA FILA COMPLETA 
        tr.appendChild(td_mesa);
        tr.appendChild(td_detalle);
        tr.appendChild(td_total);

        elementos.tabla_cuentas.appendChild(tr);

    });
}

/*** 3.4. ASIGNAR EVENTOS ***/
function asignar_eventos() {

    // Agregar Plato
    elementos.btn_agregar_plato.addEventListener('click', agregar_plato);
    
    // Registrar Mesa
    elementos.btn_registrar_mesa.addEventListener('click', registrar_mesa);
    
    // Agregar Pedido
    elementos.btn_agregar_pedido.addEventListener('click', agregar_pedido);
    
    // Pagar Mesa
    elementos.btn_pagar_mesa.addEventListener('click', pagar_mesa);
}

//FUNCIONALIDADES

function agregar_plato(){

    const codigo = parseInt(elementos.codigo_plato.value);
    const nombre = elementos.nombre_plato.value.trim();
    const precio = parseFloat(elementos.precio_plato.value);

    //VALIDAR TODO ESTE VISAJE

    if(!codigo || !nombre || !precio ){
        alert('Todos los campos son obligatorios');
        return;
    }

    if(datos.platos.some(p => p.codigo === codigo)) {
        alert (' Ya existe un plato con ese codigo mi hermano');
        return;
    }

    //AGREGAR PLATO
    datos.platos.push({codigo, nombre, precio});
    localStorage.setItem('platos', JSON.stringify(datos.platos));

    //LIMPIAR Y ACTUALIZAR
    elementos.codigo_plato.value = '';
    elementos.nombre_plato.value = '';
    elementos.precio_plato.value = '';

    actualizar_selects();
    actualizar_tablas();

    alert('Mi hermano el plato fue agregado correctamente');

}

//REGISTRAR MESA 
function registrar_mesa(){

    const numero = parseInt(elementos.numero_mesa.value);

    if(!numero){
        alert(' Ingrese un numero de mesa valido');
        return;

    }

    if(datos.mesas.some(m => m.numero === numero)) {
        alert('Ya existe una mesa con ese número');
        return;
    }

    //REGISTRAR MESA (CON ARRAY DE PEDIDOS VACIO)
    datos.mesas.push({
        numero,
        pedidos: [],
        total: 0
    });
    localStorage.setItem('mesas', JSON.stringify(datos.mesas));

    //LIMPIAR Y ACTUALIZAR 
    elementos.numero_mesa.value = '';
    actualizar_selects();

    alert('Mesa registrada con exito mijo');
}

function agregar_pedido(){
    const mesa_numero = parseInt(elementos.mesa_pedido.value);
    const plato_codigo = parseInt(elementos.plato_pedido.value);
    const mesero_id = parseInt(elementos.mesero_pedido.value);
    const cantidad = parseInt(elementos.cantidad_pedido.value);


    //VALIDACION

    if(!mesa_numero || !plato_codigo || !mesero_id || !cantidad){
        alert('Complete todos los campos del pedido mi hermano');
        return;
    }

    // BUSCAR REFERANCIAS

    const mesa = datos.mesas.find(m => m.numero === mesa_numero);
    const plato = datos.platos.find(p => p.codigo === plato_codigo);
    const empleado = datos.empleados_api.find(e => e.id === mesero_id);

    if(!mesa || !plato || !empleado) {
        alert('Error al procesar el pedido');
        return;
    }

    //CALCULAR EL SUBTOTAL 

    const subtotal = plato.precio * cantidad;

    //AGREGAR PEDIDO A LA MESA
    mesa.pedidos.push({
        plato_codigo,
        cantidad,
        subtotal,
        mesero_id
    });
    mesa.total += subtotal;

    //ACTUALIZAR MESERO

    let mesero = datos.meseros.find(m => m.id === mesero_id);
    if(!mesero) {
        mesero = {
            id: mesero_id,
            nombre: empleado.name,
            total: 0,
            pedidos: 0
        };
        datos.meseros.push(mesero);
    }
    mesero.total += subtotal;
    mesero.pedidos += 1 ;

    // GUARDAR CAMBIOS  HECHOS MI HERMANO
    localStorage.setItem('mesas', JSON.stringify(datos.mesas));
    localStorage.setItem('meseros', JSON.stringify(datos.meseros));

    //ACTUALIZAR
    actualizar_tablas();
    alert('Pedido registrado Correctamente mi hermano ');
}


// PAGAR MESA
function pagar_mesa(){
    const mesa_numero = parseInt(elementos.mesa_pagar.value);

    if(!mesa_numero){
        alert('Seleecione una mesa valida');
        return;
    }
    const mesa_index = datos.mesas.findIndex(m => m.numero === mesa_numero);

    if(mesa_index === -1) {
        alert('Mesa no encontrada mi hermano');
        return ;
    }

    //CONFIRMAR ANTES DE PAGAR
    if(!confirm(`¿Pagar Cuenta de mesa ${mesa_numero} por $${datos.mesas[mesa_index].total}?`)) {
        return;
    }

    //REGISTRAR PAGO EN EL MESERO
    const mesa = datos.mesas[mesa_index];
    if(mesa.pedidos.length > 0){
        const mesero_id = mesa.pedidos[0].mesero_id; // Tomamos el mesero del primer pedido
        const mesero = datos.meseros.find(m => m.id === mesero_id);
        if(mesero) {
            mesero.total += mesa.total;
            localStorage.setItem('meseros', JSON.stringify(datos.meseros));
        }
    }

    //REINICIAR LA MESA
    datos.mesas[mesa_index].pedidos =[];
    datos.mesas[mesa_index].total = 0 ;

    //GUARDAR CAMBIOS
    localStorage.setItem('mesas', JSON.stringify(datos.mesas));

    //ACTUALIZAR TODO
    actualizar_selects();
    actualizar_tablas();

    alert(`Mesa ${mesa_numero} pagada con todas las de la ley mi hermano `);
}