const express = require('express');

const AuthenticationRouter = require('../modules/auth/AuthencationRouter');
const StoreRouter = require('../modules/store/StoreRouter');
const ProductRouter = require('../modules/product/ProductRouter');
const CustomerRouter = require('../modules/customer/CustomerRouter');
const CartRouter = require('../modules/cart/CartRouter');
const OrderRouter = require('../modules/order/OrderRouter');
const CategoryRouter = require('../modules/categories/CategoryRouter');
const MaterialRouter = require('../modules/material/MaterialRouter');
const AddressRouter = require('../modules/address/AddressRouter');
const PaymentRouter = require('../modules/payment/PaymentRouter');
const VNPayRouter = require('../modules/vnpay/vnpayRouter');
const ReviewRouter = require('../modules/review/ReviewRouter');
const PostRouter = require('../modules/post/PostRouter');
const CommentRouter = require('../modules/comment/CommentRouter');
const LikeRouter = require('../modules/like/LikeRouter');
const LikeCommentRouter = require('../modules/likeComment/LikeCommentRouter');
const FollowRouter = require('../modules/follow/FollowRouter');
const NotificationRouter = require('../modules/notification/NotificationRouter');
const WishListRouter = require('../modules/wishList/wishListRouter');
const TypeStoreRouter = require('../modules/typeStore/typeStoreRouter');
const MessageRouter = require('../modules/message/MessageRouter');

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
    app.use('/api/v1/', VNPayRouter);
    app.use('/api/v1/', ReviewRouter);
    app.use('/api/v1/', PostRouter);
    app.use('/api/v1/', CommentRouter);
    app.use('/api/v1/', LikeRouter);
    app.use('/api/v1/', LikeCommentRouter);
    app.use('/api/v1/', FollowRouter);
    app.use('/api/v1/', NotificationRouter);
    app.use('/api/v1/', WishListRouter);
    app.use('/api/v1/', TypeStoreRouter);
    app.use('/api/v1/', MessageRouter);

}


module.exports = initRoute;