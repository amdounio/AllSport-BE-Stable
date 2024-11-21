// routes/stripeWebhook.js
const express = require('express');
const stripe = require('../config/stripe');
const { Subscription, User } = require('../config/relation');
const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    console.log(req)

    const signature = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;


    try {
        event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }
    console.log("===================> ")

    console.log(event)

    switch (event.type) {
        case 'invoice.payment_succeeded':
            // Handle successful payment
            const invoice = event.data.object;
            await Subscription.update(
                { status: 'active' },
                { where: { stripe_subscription_id: invoice.subscription } }
            );
            break;

        case 'invoice.payment_failed':
            // Handle failed payment
            const failedInvoice = event.data.object;
            await Subscription.update(
                { status: 'canceled' },
                { where: { stripe_subscription_id: failedInvoice.subscription } }
            );
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

module.exports = router;
