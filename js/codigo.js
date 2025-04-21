let productos = [];

fetch("./js/productos.json")
    .then(response => response.json())
    .then(data => {
        productos = data;
        cargar_productos(productos);
    })


const contenedor_productos = document.querySelector("#contenedor_productos");
const botones_categorias = document.querySelectorAll(".boton-categoria");
const titulo_principal = document.querySelector("#titulo-principal");
let botones_agregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector("#numerito");

botones_categorias.forEach(boton => boton.addEventListener("click", () => {
    aside.classList.remove("aside-visible");
}))

function cargar_productos(productos_elegidos) {

    contenedor_productos.innerHTML = "";

    productos_elegidos.forEach(producto => {

        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio}</p>
                <button class="producto-agregar" id="${producto.id}">Agregar</button>
            </div>
        `;

        contenedor_productos.append(div);
    })

    actualizar_botones_agregar();
}

botones_categorias.forEach(boton => {
    boton.addEventListener("click", (e) => {

        botones_categorias.forEach(boton => boton.classList.remove("active"));
        e.currentTarget.classList.add("active");

        if (e.currentTarget.id != "todos") {
            const producto_categoria = productos.find(producto => producto.categoria.id === e.currentTarget.id);
            titulo_principal.innerText = producto_categoria.categoria.nombre;
            const productos_boton = productos.filter(producto => producto.categoria.id === e.currentTarget.id);
            cargar_productos(productos_boton);
        } else {
            titulo_principal.innerText = "Todos los productos";
            cargar_productos(productos);
        }

    })
});

function actualizar_botones_agregar() {
    botones_agregar = document.querySelectorAll(".producto-agregar");

    botones_agregar.forEach(boton => {
        boton.addEventListener("click", agregar_al_carrito);
    });
}

let productos_en_carrito;

let productos_en_carrito_ls = localStorage.getItem("productos-en-carrito");

if (productos_en_carrito_ls) {
    productos_en_carrito = JSON.parse(productos_en_carrito_ls);
    actualizar_numerito();
} else {
    productos_en_carrito = [];
}


function agregar_al_carrito(e) {

    Toastify({
        text: "Producto agregado",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "linear-gradient(to right, #4b33a8, #785ce9)",
          borderRadius: "2rem",
          textTransform: "uppercase",
          fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem', // horizontal axis - can be a number or a string indicating unity. eg: '2em'
            y: '1.5rem' // vertical axis - can be a number or a string indicating unity. eg: '2em'
          },
        onClick: function(){} // Callback after click
      }).showToast();

    const idBoton = e.currentTarget.id;
    const producto_agregado = productos.find(producto => producto.id === idBoton);

    if(productos_en_carrito.some(producto => producto.id === idBoton)) {
        const index = productos_en_carrito.findIndex(producto => producto.id === idBoton);
        productos_en_carrito[index].cantidad++;
    } else {
        producto_agregado.cantidad = 1;
        productos_en_carrito.push(producto_agregado);
    }

    actualizar_numerito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productos_en_carrito));
}

function actualizar_numerito() {
    let nuevo_numerito = productos_en_carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    numerito.innerText = nuevo_numerito;
}
