const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dlva4spns',
    api_key: '887463875372382',
    api_secret: 'O2MRAHmwJBEV-2tgDZcLvACfYOU'
});

module.exports = cloudinary;