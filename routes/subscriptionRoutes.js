const express = require('express');
const { createSubscription, webhookHandler } = require('../controllers/subscriptionController');

const router = express.Router();

// Route to create a subscription
router.post('/subscribe', createSubscription);

// Stripe webhook route (ensure to set the correct endpoint secret in your environment)
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

module.exports = router;
