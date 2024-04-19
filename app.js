require('dotenv/config');

const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const api = process.env.API_URL;
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler');


app.use(cors());
app.options('*',cors());

//midfleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt);
app.use(errorHandler);
app.use('/public/uploads',express.static(__dirname+ '/public/uploads'))


//Routes
const categoriesRoutes = require('./routers/categories');
const productsRoutes = require('./routers/products');
const usersRoutes = require('./routers/users');
const orderRoutes = require('./routers/orders');
const reservationRoutes = require('./routers/reservations');
const messagesRoutes=require('./routers/messages')

app.use(`${api}/products`,productsRoutes);
app.use(`${api}/categories`,categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`,orderRoutes);
app.use(`${api}/reservations`,reservationRoutes);
app.use(`${api}/messages`,messagesRoutes)


mongoose.connect(process.env.CONNECTION_STRING)
.then(()=> {
    console.log('Database Connection is Ready...')
})
.catch((err)=>{
    console.log(err);
})

app.listen(8081,()=>{
    console.log(api);
    console.log('server is running in http://localhost:8082')
})