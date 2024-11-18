const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Add your Stripe secret key
const jwt = require('jsonwebtoken');
const { User } = require('../config/relation');
const { OAuth2Client } = require('google-auth-library'); // For Google SSO
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    const body = req.body;

    try {
        // Case 1: SSO Login (idToken and other user info)
        if (body.idToken) {
            const { idToken, id, name, email, photoUrl, firstName, lastName, provider, acceptLegalPolicy, newUser } = body;

            // Check if user exists
            let user = await User.findOne({ where: { email } });

            if (user) {
                let subscriptionStatus = { Nosubscription: true }; // Default to no subscription

                if (user.stripeCustomerId) {
    
                // Check if the user is subscribed this month
                const isSubscribedThisMonth = await checkSubscription(user.stripeCustomerId); 
    
                subscriptionStatus = {
                    Nosubscription: !isSubscribedThisMonth
                };
            }
                // If the user exists, return the idToken and newUser: false
                return res.json({
                    idToken,
                    newUser: false,
                    status: 'success',
                    user,
                    ...subscriptionStatus // Include the subscription status in the response

                });
            }

            // If user does not exist, create a new user
            user = await User.create({
                name,
                last_name: lastName,
                email,
                password: null, // SSO login does not require a password
                ssoData: {
                    idToken,
                    id,
                    name,
                    email,
                    photoUrl,
                    firstName,
                    lastName,
                    provider,
                    acceptLegalPolicy,
                },
            });

            // Return the idToken, newUser: true, and status success
            return res.json({
                idToken,
                newUser: true,
                status: 'success',
                user
            });
        }

        // Case 2: Traditional Login (email and password)
        if (body.email && body.password && !body.firstname && !body.lastname) {
            const { email, password, rememberMe } = body;

            const user = await User.findOne({ where: { email } });

            if (!user || !user.password) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Compare hashed password with the one stored in the database
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            let subscriptionStatus = { Nosubscription: true }; // Default to no subscription

            if (user.stripeCustomerId) {

            // Check if the user is subscribed this month
            const isSubscribedThisMonth = await checkSubscription(user.stripeCustomerId); 

            subscriptionStatus = {
                Nosubscription: !isSubscribedThisMonth
            };
        }


            // Generate JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: rememberMe ? '7d' : '1h' });

            // Return the response with subscription status
            return res.json({
                idToken: token,
                newUser: false,
                status: 'success',
                user,
                ...subscriptionStatus // Include the subscription status in the response
            });
        }

        // Case 3: User Registration
        if (body.firstname && body.lastname && body.email && body.password && body.acceptLegalPolicy) {
            const { firstname, lastname, email, password, acceptLegalPolicy } = body;

            // Check if user already exists
            let user = await User.findOne({ where: { email } });
            if (user) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            user = await User.create({
                name: firstname,
                firstName: firstname,
                lastName: lastname,
                email,
                password: hashedPassword,
                acceptLegalPolicy
            });

            // Generate JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            return res.json({
                idToken: token,
                newUser: true,
                status: 'success',
                user
            });
        }

        // If none of the above cases match
        return res.status(400).json({ message: 'Invalid request: email/password or idToken required' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// Method to check subscription for this month
const checkSubscription = async (stripeCustomerId) => {
    try {
        // Fetch all subscriptions for the customer from Stripe
        const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: 'active', // Only consider active subscriptions
            expand: ['data.items'],
        });

        // Get the current date and check if any subscription is active this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Loop through subscriptions and check if the subscription was created in the current month
        for (const subscription of subscriptions.data) {
            const subscriptionStartDate = new Date(subscription.created * 1000); // Convert from timestamp to date
            if (subscriptionStartDate.getMonth() === currentMonth && subscriptionStartDate.getFullYear() === currentYear) {
                return true; // Subscription is valid for this month
            }
        }

        return false; // No active subscription this month
    } catch (error) {
        console.error("Error checking subscription:", error);
        return false;
    }
};
