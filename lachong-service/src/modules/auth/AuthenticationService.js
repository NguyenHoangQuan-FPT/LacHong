const Account = require('../../models/model/Account');
const Customer = require('../../models/model/Customer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const role = require('../../models/model/Role');
const Store = require('../../models/model/Store');
const AccountDTO = require('../../models/DTOs/AccountDTO');
const StoreDTO = require('../../models/DTOs/StoreDTO');

exports.registerUser = async (req, res) => {
    const { error, value } = AccountDTO.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = value;

    try {
        const existingUser = await Account.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists.' });

        const customerRole = await role.findOne({ name: 'customer' });
        if (!customerRole) return res.status(500).json({ message: 'Default role not found.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new Account({ email, password: hashedPassword, roleId: customerRole._id });
        await user.save();

        const newCustomer = new Customer({
            email: email,
            fullName: "",
            phone: "",
            address: "",
            accountId: user._id
        });
        await newCustomer.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

exports.registerStore = async (req, res) => {
    try {

        const { error: errorAccount, value: accountValue } = AccountDTO.validate({
            email: req.body.email,
            password: req.body.password
        });
        if (errorAccount) return res.status(400).json({ message: errorAccount.details[0].message });

        const { error: errorStore, value: storeValue } = StoreDTO.validate({
            storeName: req.body.storeName,
            emailStore: req.body.emailStore
        });
        if (errorStore) return res.status(400).json({ message: errorStore.details[0].message });

        const value = { ...accountValue, ...storeValue };
        const { email, password, storeName, emailStore } = value;



        const existingUser = await Account.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists.' });

        const managerRole = await role.findOne({ name: 'manager' });
        if (!managerRole) return res.status(500).json({ message: 'Default role not found.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new Account({ email, password: hashedPassword, roleId: managerRole._id });
        await user.save();

        const store = new Store({
            storeName: storeName,
            emailStore: emailStore,
            ownerId: user._id
        });
        await store.save();

        res.status(201).json({ message: 'Store registered successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Account.findOne({ email }).populate('roleId');
        if (!user) return res.status(400).json({ message: 'Invalid username or password.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid username or password.' });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.roleId.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
}

exports.logout = async (req, res) => {
    res.json({ message: 'Logout successful' });
}   