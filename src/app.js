import express from 'express';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';

const app = express();
const PORT = process.env.PORT||8080;

app.listen(PORT, ()=>console.log(`Escuchando en el puerto ${PORT}`));


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.use(express.json());
app.use(express.static('./src/public'));


