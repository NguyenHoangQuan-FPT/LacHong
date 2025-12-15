const express = require('express');

const AuthenticationRouter = require('../modules/auth/AuthencationRouter');
const StoreRouter = require('../modules/store/StoreRouter');
const ProductRouter = require('../modules/product/ProductRouter');
const CustomerRouter = require('../modules/customer/CustomerRouuter');
const CartRouter = require('../modules/cart/CartRouter');
const OrderRouter = require('../modules/order/OrderRouter');
const CategoryRouter = require('../modules/categories/CategoryRouter');
const MaterialRouter = require('../modules/material/MaterialRouter');
const AddressRouter = require('../modules/address/AddressRouter');
const PaymentRouter = require('../modules/payment/PaymentRouter');
const ReviewRouter = require('../modules/review/ReviewRouter');
const PostRouter = require('../modules/post/PostRouter');
const CommentRouter = require('../modules/comment/CommentRouter');
const LikeRouter = require('../modules/like/LikeRouter');
const LikeCommentRouter = require('../modules/likeComment/LikeCommentRouter');

const initRoute = (app) => {

    app.use('/api/v1/', AuthenticationRouter);
    app.use('/api/v1/', StoreRouter);
    app.use('/api/v1/', ProductRouter);
    app.use('/api/v1/', CustomerRouter);
    app.use('/api/v1/', CartRouter);
    app.use('/api/v1/', OrderRouter);
    app.use('/api/v1/', CategoryRouter);
    app.use('/api/v1/', MaterialRouter);
    app.use('/api/v1/', AddressRouter);
    app.use('/api/v1/', PaymentRouter);
    app.use('/api/v1/', ReviewRouter);
    app.use('/api/v1/', PostRouter);
    app.use('/api/v1/', CommentRouter);
    app.use('/api/v1/', LikeRouter);
    app.use('/api/v1/', LikeCommentRouter);

}


module.exports = initRoute;