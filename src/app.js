import express from 'express';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import { fileURLToPath } from 'url';
import path from 'path';
import handlebars from 'express-handlebars';
import { Server as HttpServer } from 'http';  // Para crear el servidor HTTP
import { Server as SocketIOServer } from 'socket.io';  // Importar socket.io

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine({
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout: 'main',
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// Middleware para manejar JSON
app.use(express.json());

// Rutas para vistas
app.get('/', (req, res) => {
    const products = [
        { id: 1, title: 'Producto 1', price: 100 },
        { id: 2, title: 'Producto 2', price: 200 }
    ];
    res.render('Home', { products });
});

app.get('/realTimeProducts', (req, res) => {
    const products = [
        { id: 1, title: 'Producto 1', price: 100 },
        { id: 2, title: 'Producto 2', price: 200 }
    ];
    res.render('realTimeProducts', { products });
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas para API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Crear el servidor HTTP
const server = HttpServer(app);

// Inicializar socket.io con el servidor HTTP
const io = new SocketIOServer(server);

// Lista de productos en memoria (inicialmente vacía)
const products = [];

// Manejo de conexiones socket.io
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar la lista de productos actual al cliente
    socket.emit('products', products);

    // Escucha de nuevos productos
    socket.on('newProduct', (product) => {
        products.push(product);
        io.emit('products', products); // Enviar la lista actualizada a todos los clientes
    });

    // Escucha de eliminación de productos
    socket.on('deleteProduct', (productIndex) => {
        products.splice(productIndex, 1);
        io.emit('products', products); // Enviar la lista actualizada a todos los clientes
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Iniciar el servidor
server.listen(PORT, () => console.log(`Escuchando en el puerto ${PORT}`));
