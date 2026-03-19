const Account = require('../../models/model/Account');
const Customer = require('../../models/model/Customer');
const Store = require('../../models/model/Store');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const role = require('../../models/model/Role');
const AccountDTO = require('../../models/DTOs/AccountDTO');
const { sendEmail } = require('../../services/sendEmail');
const fs = require("fs");
const path = require("path");


const DEFAULT_AVATAR = process.env.DEFAULT_AVATAR_URL || "https://ui-avatars.com/api/?name=A&background=2563eb&color=fff&bold=true&size=200";
const generateInitialAvatar = () => DEFAULT_AVATAR;

// const pickFrontendOrigin = () => {
//     const candidates = [
//         'http://localhost:5173'
//     ].filter(Boolean);

//     for (const raw of candidates) {
//         const first = String(raw).split(',')[0].trim();
//         if (first) return first.replace(/\/$/, '');
//     }
//     return 'http://localhost:5173';
// };

exports.registerUser = async (req, res) => {
    // let htmlTemplate = fs.readFileSync(
    //     path.join(__dirname, '../../template/sendEmail.html'), 'utf-8');


    const { error, value } = AccountDTO.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = value;

    try {
        const existingUser = await Account.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists.' });

        const customerRole = await role.findOne({ name: 'customer' });
        if (!customerRole) return res.status(500).json({ message: 'Default role not found.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // const activeAccount = crypto.randomBytes(20).toString('hex');


        const user = new Account({
            email,
            password: hashedPassword,
            roleId: customerRole._id,
            // activationToken: activeAccount,
            // activationTokenExpires: Date.now() + 24 * 60 * 60 * 1000
        });

        // const activationLink = `${pickFrontendOrigin()}/active-account/${activeAccount}`;

        // htmlTemplate = htmlTemplate.replace(/{{ACTIVE_LINK}}/g, activationLink);

        // console.log('🔄 Attempting to send activation email to:', email);
        // try {
        //     await sendEmail(
        //         email,
        //         'Activate Your Account',
        //         htmlTemplate
        //     );
        //     console.log('✅ Activation email sent successfully');
        // } catch (emailError) {
        //     console.error('❌ Failed to send activation email:', emailError);
        //     return res.status(500).json({ message: 'Gửi email kích hoạt thất bại, vui lòng thử lại sau.' });
        // }

        await user.save();

        const newCustomer = new Customer({
            email: email,
            accountId: user._id,
            avatar: generateInitialAvatar(email)
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
        const { email, password } = accountValue;

        const existingUser = await Account.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists.' });

        const managerRole = await role.findOne({ name: 'manager' });
        if (!managerRole) return res.status(500).json({ message: 'Default role not found.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new Account({ email, password: hashedPassword, roleId: managerRole._id });
        await user.save();

        const store = new Store({
            email: email,
            ownerId: user._id,
            status: 'PENDING'
        });
        await store.save();

        res.status(201).json({ message: 'Store account registered successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}


// Generate access and refresh tokens
function generateTokens(user) {
    const accessToken = jwt.sign({ id: user._id, email: user.email, role: user.roleId.name }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET_KEY, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Account.findOne({ email, status: true }).populate('roleId');
        if (!user) return res.status(400).json({ message: 'Invalid username or password.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid username or password.' });

        // const roleName = user?.roleId?.name;
        // if (roleName === 'customer' && !user.isActive) {
        //     return res.status(403).json({ message: 'Account is not activated.' });
        // }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Save refresh token to user (for demo, production should use DB or Redis)
        user.refreshToken = refreshToken;
        await user.save();

        res.json({ user, accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
}
// Endpoint to refresh access token
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided.' });
    try {
        // Find user by refresh token
        const user = await Account.findOne({ refreshToken });
        if (!user) return res.status(403).json({ message: 'Invalid refresh token.' });
        // Verify refresh token
        const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
        // Generate new access token
        const accessToken = jwt.sign({ id: user._id, email: user.email, role: user.roleId.name }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }
}

exports.logout = async (req, res) => {
    res.json({ message: 'Logout successful' });
}

exports.activeAccount = async (req, res) => {
    try {
        const token = req.params.token || req.body.token;

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