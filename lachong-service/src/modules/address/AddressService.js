const Address = require('../../models/model/Address');
const Customer = require('../../models/model/Customer');

exports.addAddress = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { address } = req.body;

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        const hasAddresses = Array.isArray(customer.addresses) && customer.addresses.length > 0;

        const newAddress = new Address({
            customerId: customer._id,
            address,
            isDefault: !hasAddresses
        });

        const savedAddress = await newAddress.save();

        customer.addresses.push(savedAddress._id);
        await customer.save();

        return res.status(201).json({ message: 'Address added successfully', address: savedAddress });
    } catch (error) {
        console.error('Error adding address:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAddresses = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const address = await Address.find({ customerId: customer._id }).sort({ isDefault: -1, createdAt: -1 });

        return res.status(200).json({ addresses: address });
    } catch (error) {
        console.error('Error retrieving addresses:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { addressId } = req.params;
        const { address } = req.body;

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const existingAddress = await Address.findOne({ _id: addressId, customerId: customer._id });
        if (!existingAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        existingAddress.address = address || existingAddress.address;

        const updatedAddress = await existingAddress.save();

        return res.status(200).json({ message: 'Address updated successfully', address: updatedAddress });
    } catch (error) {
        console.error('Error updating address:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.setDefaultAddress = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { addressId } = req.params;

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const target = await Address.findOne({ _id: addressId, customerId: customer._id });
        if (!target) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // clear existing defaults
        await Address.updateMany({ customerId: customer._id, isDefault: true }, { isDefault: false });

        target.isDefault = true;
        await target.save();

        return res.status(200).json({ message: 'Default address updated', address: target });
    } catch (error) {
        console.error('Error setting default address:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { addressId } = req.params;

        const customer = await Customer.findOne({ accountId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const existingAddress = await Address.findOne({ _id: addressId, customerId: customer._id });
        if (!existingAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        await Address.deleteOne({ _id: addressId });

        customer.addresses = customer.addresses.filter(addrId => addrId.toString() !== addressId);
        await customer.save();

        // If the deleted one was default, set another as default (first one if exists)
        if (existingAddress.isDefault) {
            const fallback = await Address.findOne({ customerId: customer._id }).sort({ createdAt: -1 });
            if (fallback) {
                fallback.isDefault = true;
                await fallback.save();
            }
        }

        return res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};