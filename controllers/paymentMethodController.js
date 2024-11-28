const stripe = require('../config/stripe');
const { User } = require('../config/relation');

// Helper function to validate user and get Stripe customer
const validateUserAndGetCustomer = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user || !user.stripeCustomerId) {
        throw new Error('User not found or no Stripe customer ID');
    }
    return user;
};

// Helper function to verify payment method ownership
const verifyPaymentMethodOwnership = async (paymentMethodId, stripeCustomerId) => {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== stripeCustomerId) {
        throw new Error('Payment method does not belong to this customer');
    }
    return paymentMethod;
};

const addPaymentMethod = async (req, res) => {
    try {
        const { userId, paymentMethodId } = req.body;

        // Validate inputs
        if (!userId || !paymentMethodId) {
            return res.status(400).json({ message: 'Missing required fields: userId or paymentMethodId' });
        }

        // Validate user and get Stripe customer
        const user = await validateUserAndGetCustomer(userId);
        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ message: 'User not found or invalid Stripe customer ID' });
        }

        // Attach the payment method to the customer
        try {
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: user.stripeCustomerId,
            });
        } catch (error) {
            if (error.type === 'StripeInvalidRequestError' && error.raw && error.raw.param === 'payment_method') {
                return res.status(400).json({ message: `Invalid PaymentMethod ID: ${paymentMethodId}` });
            }
            throw error; // Re-throw for general error handling
        }

        // Check if this should be the default payment method
        const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: 'card',
        });

        // Set as default if this is the only payment method
        const shouldSetAsDefault = paymentMethods.data.length === 1;
        if (shouldSetAsDefault) {
            await stripe.customers.update(user.stripeCustomerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
        }

        // Respond with success
        res.status(200).json({
            message: 'Payment method added successfully',
            isDefault: shouldSetAsDefault,
        });
    } catch (error) {
        console.error('Error adding payment method:', error);
        const statusCode = error.type === 'StripeInvalidRequestError' ? 400 : 500;
        res.status(statusCode).json({
            message: error.message || 'An unexpected error occurred while adding the payment method',
        });
    }
};


const deletePaymentMethod = async (req, res) => {
    try {
        const { userId } = req.body;
        const { paymentMethodId } = req.params;

        if (!userId || !paymentMethodId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user = await validateUserAndGetCustomer(userId);
        await verifyPaymentMethodOwnership(paymentMethodId, user.stripeCustomerId);

        // Check if this is the default payment method
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        const isDefault = customer.invoice_settings.default_payment_method === paymentMethodId;

        // Detach the payment method
        await stripe.paymentMethods.detach(paymentMethodId);

        // If this was the default, try to set a new default
        if (isDefault) {
            const remainingMethods = await stripe.paymentMethods.list({
                customer: user.stripeCustomerId,
                type: 'card',
                limit: 1
            });

            if (remainingMethods.data.length > 0) {
                await stripe.customers.update(user.stripeCustomerId, {
                    invoice_settings: {
                        default_payment_method: remainingMethods.data[0].id,
                    },
                });
            }
        }

        res.status(200).json({ message: 'Payment method deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment method:', error);
        res.status(error.message.includes('not found') ? 404 : 500)
           .json({ message: error.message || 'Error deleting payment method' });
    }
};

const setDefaultPaymentMethod = async (req, res) => {
    try {
        const { userId } = req.body;
        const { paymentMethodId } = req.params;

        if (!userId || !paymentMethodId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user = await validateUserAndGetCustomer(userId);
        await verifyPaymentMethodOwnership(paymentMethodId, user.stripeCustomerId);

        await stripe.customers.update(user.stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        res.status(200).json({ message: 'Default payment method updated successfully' });
    } catch (error) {
        console.error('Error setting default payment method:', error);
        res.status(error.message.includes('not found') ? 404 : 500)
           .json({ message: error.message || 'Error setting default payment method' });
    }
};

const getPaymentMethods = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user = await validateUserAndGetCustomer(userId);

        // Get all payment methods for the customer
        const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: 'card',
        });

        // Get customer to check default payment method
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;

        // Format the payment methods response
        const formattedPaymentMethods = paymentMethods.data.map(pm => ({
            id: pm.id,
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
            isDefault: pm.id === defaultPaymentMethodId
        }));

        res.status(200).json(formattedPaymentMethods);
    } catch (error) {
        console.error('Error retrieving payment methods:', error);
        res.status(error.message.includes('not found') ? 404 : 500)
           .json({ message: error.message || 'Error retrieving payment methods' });
    }
};

module.exports = {
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    getPaymentMethods
};