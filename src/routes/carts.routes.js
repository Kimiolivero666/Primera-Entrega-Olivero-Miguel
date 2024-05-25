import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// Ruta al archivo JSON que usaremos como base de datos para los carritos
const cartsFilePath = path.join(__dirname, 'carts.json');
const productsFilePath = path.join(__dirname, 'products.json');

// Función para leer los carritos desde el archivo JSON
const readCarts = () => {
    if (!fs.existsSync(cartsFilePath)) {
        return [];
    }
    const data = fs.readFileSync(cartsFilePath, 'utf-8');
    return JSON.parse(data);
};

// Función para escribir los carritos al archivo JSON
const writeCarts = (carts) => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2), 'utf-8');
};

// Función para generar un ID único
const generateUniqueId = (items) => {
    const lastItem = items[items.length - 1];
    return lastItem ? lastItem.id + 1 : 1;
};

// Ruta raíz POST / que crea un nuevo carrito
router.post('/', (req, res) => {
    const carts = readCarts();
    const newCart = {
        id: generateUniqueId(carts),
        products: []
    };
    carts.push(newCart);
    writeCarts(carts);
    res.status(201).json(newCart);
});

// Ruta GET /:cid que lista los productos del carrito con el id proporcionado
router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    const carts = readCarts();
    const cart = carts.find(c => c.id === parseInt(cid, 10));
    if (!cart) {
        return res.status(404).send('Carrito no encontrado');
    }
    res.json(cart.products);
});

// Ruta POST /:cid/product/:pid que agrega un producto al carrito proporcionado
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const carts = readCarts();
    const cart = carts.find(c => c.id === parseInt(cid, 10));
    if (!cart) {
        return res.status(404).send('Carrito no encontrado');
    }

    const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
    const product = products.find(p => p.id === parseInt(pid, 10));
    if (!product) {
        return res.status(404).send('Producto no encontrado');
    }

    const cartProduct = cart.products.find(p => p.product === parseInt(pid, 10));
    if (cartProduct) {
        cartProduct.quantity += 1;
    } else {
        cart.products.push({ product: parseInt(pid, 10), quantity: 1 });
    }

    writeCarts(carts);
    res.status(201).json(cart);
});

export default router;
