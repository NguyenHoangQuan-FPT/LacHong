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
        console.log(accountId);

        const { fullName, phone, address } = req.body;

        const customer = await Customer.findOne({ accountId: accountId });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }
        const updateProfile = await Customer.findByIdAndUpdate(customer._id, {
            fullName: fullName || customer.fullName,
            phone: phone || customer.phone,
            address: address || customer.address
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