
const datos = {
    vehiculos: JSON.parse(localStorage.getItem('vehiculos')) || [],
    historial: JSON.parse(localStorage.getItem('historial')) || [],
    operadores: []
}

const precios = {
    carro: 3000,
    moto: 1500,
    bicicleta: 500
};

const elementos = {
    select_del_operador: document.getElementById("empleados")


}



document.addEventListener("DOMContentLoaded", ()=>{
    //Esto es para cargar las funciones que tengo 

    cargar_empleados();
    actualizar_select_operador();
    

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