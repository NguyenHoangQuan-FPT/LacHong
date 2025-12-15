const { connectMongoDB } = require('./src/config/mongodb');

module.exports = connectMongoDB;
module.exports.connectMongoDB = connectMongoDB;