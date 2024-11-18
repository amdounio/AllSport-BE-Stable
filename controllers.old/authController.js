const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User  = require('../models/User');
const { OAuth2Client } = require('google-auth-library'); // For Google SSO
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Traditional or SSO Login
exports.login = async (req, res) => {
    const { email, password, SSOData } = req.body;

    try {
        // 1. Traditional Login: email and password provided

        if (email && password) {
            const user = await User.findOne({ where: { email } });

            if (!user || !user.password) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token });
        }

        // 2. SSO Login: email and password not provided, use SSOData
        if (SSOData) {
            const { email, idToken, provider } = SSOData;

            let payload;
            if (provider === 'google') {
                const ticket = await client.verifyIdToken({
                    idToken,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();  // get the payload that contains email
            } else {
                // Add verification for other providers like iCloud here
                return res.status(400).json({ message: 'Unsupported SSO provider' });
            }

            // Check if user exists by email in the database
            const user = await User.findOne({ where: { email: payload.email } });

            if (!user) {
                // User is not registered
                return res.status(200).json({
                    registered: false,
                    SSOData: {
                        idToken,
                        id: payload.sub,
                        name: payload.name,
                        email: payload.email,
                        photoUrl: payload.picture,
                        firstName: payload.given_name,
                        lastName: payload.family_name,
                        provider
                    }
                });
            }

            // If user exists, generate and return JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token });
        }

        // If neither traditional login nor SSOData are provided, return an error
        return res.status(400).json({ message: 'Email, password or SSO data required' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error'+error });
    }
};
