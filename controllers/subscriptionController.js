const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use your Stripe Secret Key
const { User } = require('../models/User'); // Adjust according to your User model

// Controller to create a subscription
const createSubscription = async (req, res) => {
    const { userId, plan } = req.body; // Expecting userId and subscription plan (e.g., 'basic', 'pro', 'business')

    try {
        const user = await User.findByPk(userId); // Find the user by ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new Stripe customer if the user doesn't have one
        if (!user.stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
            });
            user.stripeCustomerId = customer.id; // Save Stripe customer ID to your database
            await user.save(); // Save user data
        }

        // Create the subscription
        const subscription = await stripe.subscriptions.create({
            customer: user.stripeCustomerId,
            items: [{ price: plan }], // Use the price ID you created in the Stripe Dashboard
            expand: ['latest_invoice.payment_intent'], // Expand to get the payment intent
        });

        // Respond with subscription details
        res.status(200).json({ subscription });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ message: 'Error creating subscription' });
    }
};

// Controller to handle webhook events from Stripe (optional)
const webhookHandler = async (req, res) => {
    const event = req.body;

    // Handle the event
    switch (event.type) {
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            // Handle successful payment, e.g., update user subscription status in the database
            break;
        // Handle other events as necessary

        default:
            console.warn(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
};

module.exports = {
    createSubscription,
    webhookHandler,
};
