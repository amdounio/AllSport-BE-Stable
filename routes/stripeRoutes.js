// routes/stripeRoutes.js
const express = require('express');
const router = express.Router();
const StripeController = require('../controllers/StripeController');

router.post('/subscribe/free', StripeController.subscribeFree);

// Route to subscribe to the Basic plan
router.post('/subscribe/basic', StripeController.subscribeBasic);

// Route to subscribe to the Pro plan
router.post('/subscribe/pro', StripeController.subscribePro);

// Route to subscribe to the Business plan
router.post('/subscribe/business', StripeController.subscribeBusiness);

// Route to check the current subscription status
router.get('/subscription/status', StripeController.checkSubscription);

router.get('/subscription/plan', StripeController.getUserPlan);


module.exports = router;
