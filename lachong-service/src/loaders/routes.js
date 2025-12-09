const express = require('express');

const AuthenticationRouter = require('../modules/auth/AuthencationRouter');
const StoreRouter = require('../modules/store/StoreRouter');
const ProductRouter = require('../modules/product/ProductRouter');
const CustomerRouter = require('../modules/customer/CustomerRouuter');
const CartRouter = require('../modules/cart/CartRouter');
const CategoryRouter = require('../modules/categories/CategoryRouter');
const MaterialRouter = require('../modules/material/MaterialRouter');

const initRoute = (app) => {

    app.use('/api/v1/', AuthenticationRouter);
    app.use('/api/v1/', StoreRouter);
    app.use('/api/v1/', ProductRouter);
    app.use('/api/v1/', CustomerRouter);
    app.use('/api/v1/', CartRouter);
    app.use('/api/v1/', CategoryRouter);
    app.use('/api/v1/', MaterialRouter);

}


module.exports = initRoute;