const Product = require('../../models/model/Product');

exports.getAll = async (req, res) => {
    try {
        // You can add pagination, filtering, projection as needed
        const products = await Product.find().lean().exec();
        return res.json({ products });
    } catch (error) {
        console.error('Error fetching products', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
