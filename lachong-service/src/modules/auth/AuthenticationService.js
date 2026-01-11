const Account = require('../../models/model/Account');
const Customer = require('../../models/model/Customer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const role = require('../../models/model/Role');
const Store = require('../../models/model/Store');
const AccountDTO = require('../../models/DTOs/AccountDTO');
const StoreDTO = require('../../models/DTOs/StoreDTO');
const Notification = require('../../models/model/Notification');
const { sendEmail } = require('../../services/sendEmail');
const fs = require("fs");
const path = require("path");

exports.registerUser = async (req, res) => {
    let htmlTemplate = fs.readFileSync(
        path.join(__dirname, '../../template/sendEmail.html'), 'utf-8');


    const { error, value } = AccountDTO.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = value;

    try {
        const existingUser = await Account.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists.' });

        const customerRole = await role.findOne({ name: 'customer' });
        if (!customerRole) return res.status(500).json({ message: 'Default role not found.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const activeAccount = crypto.randomBytes(20).toString('hex');

        const user = new Account({
            email,
            password: hashedPassword,
            roleId: customerRole._id,
            activationToken: activeAccount,
            activationTokenExpires: Date.now() + 24 * 60 * 60 * 1000
        });

        const activationLink = `${process.env.CORS_ORIGINS}/active-account/${activeAccount}`;

        htmlTemplate = htmlTemplate.replace(/{{ACTIVE_LINK}}/g, activationLink);


        await sendEmail(
            email,
            'Activate Your Account',
            htmlTemplate
        );

        await user.save();

        const newCustomer = new Customer({
            email: email,
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
            ownerId: user._id,
            status: 'PENDING'
        });
        await store.save();

        const admins = await Account.find({ status: true }).populate('roleId');
        for (const admin of admins) {
            if (admin.roleId && admin.roleId.name === 'admin') {
                const adminNoti = new Notification({
                    receiver: admin._id,
                    store: store._id,
                    title: 'Yêu cầu duyệt cửa hàng mới',
                    message: `Cửa hàng "${storeName}" vừa đăng ký mới và chờ duyệt.`,
                    type: 'SYSTEM'
                });
                await adminNoti.save();
            }
        }

        res.status(201).json({ message: 'Store registered successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Account.findOne({ email, status: true }).populate('roleId');
        if (!user) return res.status(400).json({ message: 'Invalid username or password.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid username or password.' });

        if (!user.isActive) return res.status(403).json({ message: 'Account is not activated.' });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.roleId.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
}

exports.logout = async (req, res) => {
    res.json({ message: 'Logout successful' });
}

exports.activeAccount = async (req, res) => {
    try {
        const { token } = req.body

        const account = await Account.findOne({ activationToken: token, activationTokenExpires: { $gt: Date.now() } });
        if (!account) {
            return res.status(400).json({ message: 'Invalid or expired activation token.' });
        }

        account.isActive = true;
        account.activationToken = undefined;
        account.activationTokenExpires = undefined;
        await account.save();

        res.json({ message: 'Account activated successfully.' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}