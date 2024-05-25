import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const router = Router();
const uploader = multer();

// Ruta al archivo JSON que usaremos como base de datos
const productsFilePath = path.join(__dirname, 'products.json');

// Función para leer los productos desde el archivo JSON
const readProducts = () => {
    if (!fs.existsSync(productsFilePath)) {
        return [];
    }
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
};

// Función para escribir los productos al archivo JSON
const writeProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
};

// Función para generar un ID único
const generateUniqueId = () => {
    const products = readProducts();
    const lastProduct = products[products.length - 1];
    return lastProduct ? lastProduct.id + 1 : 1;
};

// Ruta raíz GET / que lista los productos con una limitación opcional
router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit, 10);
    const products = readProducts();
    if (limit) {
        return res.json(products.slice(0, limit));
    }
    res.json(products);
});

// Ruta GET /:pid que trae solo el producto con el id seleccionado
router.get('/:pid', (req, res) => {
    const { pid } = req.params;
    const products = readProducts();
    const product = products.find(p => p.id === parseInt(pid, 10));
    if (!product) {
        return res.status(404).send('Producto no encontrado');
    }
    res.json(product);
});

// Ruta raíz POST / que agrega un nuevo producto
router.post('/', uploader.single(), (req, res) => {
    const { title, description, code, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !stock || !category || !thumbnails) {
        return res.status(400).send('Faltan campos requeridos');
    }

    const newProduct = {
        id: generateUniqueId(),
        title,
        description,
        code,
        status: true,
        stock: parseInt(stock, 10),
        category,
        thumbnails: Array.isArray(thumbnails) ? thumbnails : [thumbnails]
    };

    const products = readProducts();
    products.push(newProduct);
    writeProducts(products);

    res.status(201).json(newProduct);
});

// Ruta PUT /:pid para actualizar un producto existente
router.put('/:pid', (req, res) => {
    const { pid } = req.params;
    const { title, description, code, status, stock, category, thumbnails } = req.body;

    let products = readProducts();
    const productIndex = products.findIndex(p => p.id === parseInt(pid, 10));

    if (productIndex === -1) {
        return res.status(404).send('Producto no encontrado');
    }

    const updatedProduct = {
        ...products[productIndex],
        title: title !== undefined ? title : products[productIndex].title,
        description: description !== undefined ? description : products[productIndex].description,
        code: code !== undefined ? code : products[productIndex].code,
        status: status !== undefined ? status : products[productIndex].status,
        stock: stock !== undefined ? parseInt(stock, 10) : products[productIndex].stock,
        category: category !== undefined ? category : products[productIndex].category,
        thumbnails: thumbnails !== undefined ? (Array.isArray(thumbnails) ? thumbnails : [thumbnails]) : products[productIndex].thumbnails
    };

    products[productIndex] = updatedProduct;
    writeProducts(products);

    res.json(updatedProduct);
});

// Ruta DELETE /:pid que elimina un producto existente
router.delete('/:pid', (req, res) => {
    const { pid } = req.params;

    let products = readProducts();
    const productIndex = products.findIndex(p => p.id === parseInt(pid, 10));

    if (productIndex === -1) {
        return res.status(404).send('Producto no encontrado');
    }

    products.splice(productIndex, 1);
    writeProducts(products);

    res.status(204).send();
});

export default router;
