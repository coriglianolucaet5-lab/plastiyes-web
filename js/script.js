const API_URL = 'https://coriglianolucaet5-lab.github.io/plastiyes-web/productos.json';

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

const productosContainer = document.getElementById('productos-container');
const carritoContainer = document.getElementById('carrito-contenedor');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('carrito-total');
const totalContainer = document.getElementById('carrito-total-container');
const vaciarBtn = document.getElementById('vaciar-carrito');
const finalizarBtn = document.getElementById('finalizar-compra');

async function fetchProductos() {
    try {
        const respuesta = await fetch(API_URL);
        const productos = await respuesta.json();
        renderProductos(productos);
    } catch (error) {
        productosContainer.innerHTML = '<p class="carrito-vacio">Error al cargar productos. Intenta de nuevo más tarde.</p>';
    }
}

function renderProductos(productos) {
    productosContainer.innerHTML = '';

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'card';

        const medidasHTML = producto.medidas.map(m => `<li>${m}</li>`).join('');

        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <ul class="medidas">${medidasHTML}</ul>
            <p class="producto-precio">$${(producto.precio).toLocaleString('es-AR')}</p>
            <button class="btn-agregar" data-id="${producto.id}">Agregar</button>
        `;

        const btnAgregar = card.querySelector('.btn-agregar');
        btnAgregar.addEventListener('click', () => agregarAlCarrito(producto));

        productosContainer.appendChild(card);
    });
}

function agregarAlCarrito(producto) {
    const existente = carrito.find(item => item.id === producto.id);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarCarrito();
    mostrarNotificacion(`${producto.nombre} agregado al carrito`);
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito();
    actualizarCarrito();
}

function cambiarCantidad(id, accion) {
    const item = carrito.find(item => item.id === id);

    if (accion === 'sumar') {
        item.cantidad++;
    } else if (accion === 'restar') {
        item.cantidad--;
        if (item.cantidad <= 0) {
            eliminarDelCarrito(id);
            return;
        }
    }

    guardarCarrito();
    actualizarCarrito();
}

function actualizarCarrito() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = totalItems;

    if (carrito.length === 0) {
        carritoContainer.innerHTML = '<p class="carrito-vacio">El carrito está vacío</p>';
        totalContainer.style.display = 'none';
        return;
    }

    totalContainer.style.display = 'block';

    carritoContainer.innerHTML = '';

    carrito.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-carrito';

        div.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}">
            <div class="item-info">
                <p class="item-nombre">${item.nombre}</p>
                <p class="item-precio">$${(item.precio).toLocaleString('es-AR')} c/u</p>
            </div>
            <div class="item-cantidad">
                <button class="btn-restar" data-id="${item.id}">-</button>
                <span>${item.cantidad}</span>
                <button class="btn-sumar" data-id="${item.id}">+</button>
            </div>
            <p>$${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
            <button class="btn-eliminar" data-id="${item.id}">Eliminar</button>
        `;

        div.querySelector('.btn-restar').addEventListener('click', () => cambiarCantidad(item.id, 'restar'));
        div.querySelector('.btn-sumar').addEventListener('click', () => cambiarCantidad(item.id, 'sumar'));
        div.querySelector('.btn-eliminar').addEventListener('click', () => eliminarDelCarrito(item.id));

        carritoContainer.appendChild(div);
    });

    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
}

function finalizarCompra() {
    if (carrito.length === 0) return;

    const modal = document.createElement('div');
    modal.className = 'modal-compra';

    modal.innerHTML = `
        <div class="modal-compra-contenido">
            <h3>Compra finalizada</h3>
            <p>Gracias por tu compra, ${ obtenerNombreUsuario() }.</p>
            <p>Te contactaremos a la brevedad.</p>
            <button id="cerrar-modal">Cerrar</button>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#cerrar-modal').addEventListener('click', () => {
        modal.remove();
    });

    carrito = [];
    guardarCarrito();
    actualizarCarrito();
}

function obtenerNombreUsuario() {
    const inputNombre = document.querySelector('input[name="nombre"]');
    return inputNombre && inputNombre.value ? inputNombre.value : 'cliente';
}

function mostrarNotificacion(mensaje) {
    const notif = document.createElement('div');
    notif.className = 'notificacion';
    notif.textContent = mensaje;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.remove();
    }, 2000);
}

function validarFormulario(event) {
    const nombre = document.querySelector('input[name="nombre"]');
    const email = document.querySelector('input[name="email"]');
    const mensaje = document.querySelector('textarea[name="mensaje"]');

    if (!nombre.value.trim()) {
        event.preventDefault();
        mostrarNotificacion('Completá tu nombre');
        nombre.focus();
        return false;
    }

    if (!email.value.trim()) {
        event.preventDefault();
        mostrarNotificacion('Completá tu correo');
        email.focus();
        return false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.value)) {
        event.preventDefault();
        mostrarNotificacion('Correo electrónico inválido');
        email.focus();
        return false;
    }

    if (!mensaje.value.trim()) {
        event.preventDefault();
        mostrarNotificacion('Escribí tu mensaje');
        mensaje.focus();
        return false;
    }

    return true;
}

const formulario = document.querySelector('form');
if (formulario) {
    formulario.addEventListener('submit', validarFormulario);
}

if (vaciarBtn) {
    vaciarBtn.addEventListener('click', vaciarCarrito);
}

if (finalizarBtn) {
    finalizarBtn.addEventListener('click', finalizarCompra);
}

fetchProductos();
actualizarCarrito();
