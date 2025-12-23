const Customer = require('../../models/model/Customer');

exports.getProfileCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({ accountId: req.user.id });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        res.status(200).json({
            message: "Customer profile retrieved successfully.",
            customer
        });
    } catch (error) {
        console.error("Error getting customer profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updateProfileCustomer = async (req, res) => {
    try {

        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const { fullName, phone, address, dob } = req.body;

        const customer = await Customer.findOne({ accountId: accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        const avatar = (req.file && req.file.path) ? req.file.path : customer.avatar;
        const updateProfile = await Customer.findByIdAndUpdate(customer._id, {
            fullName: fullName || customer.fullName,
            phone: phone || customer.phone,
            address: address || customer.address,
            dob: dob || customer.dob,
            avatar
        }, { new: true });

        res.status(200).json({
            message: "Customer profile updated successfully.",
            customer: updateProfile
        });
    } catch (error) {
        console.error("Error updating customer profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getAllCustomers = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        const role = req.user?.role;
        if (role !== 'admin') {
            return res.status(403).json({ message: "Forbidden. Admins only." });
        }

        const customers = await Customer.find();
        res.status(200).json({
            message: "Customers retrieved successfully.",
            customers
        });
    } catch (error) {
        console.error("Error getting all customers:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getAllCustomerById = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        const role = req.user?.role;
        if (role !== 'admin') {
            return res.status(403).json({ message: "Forbidden. Admins only." });
        }

        const { id } = req.params;
        const customer = await Customer.findById(id).populate('addresses');
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        res.status(200).json({
            message: "Customer retrieved successfully.",
            customer
        });
    } catch (error) {
        console.error("Error getting customer by ID:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updateStatusCustomer = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        const role = req.user?.role;
        if (role !== 'admin') {
            return res.status(403).json({ message: "Forbidden. Admins only." });
        }

        const { id } = req.params;
        const { status } = req.body;

        const customer = await Customer.findByIdAndUpdate(
            id,
            { $set: { status: status } },
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }
        res.status(200).json({
            message: "Customer status updated successfully.",
            customer
        });
    } catch (error) {
        console.error("Error updating customer status:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}