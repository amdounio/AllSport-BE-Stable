const express = require('express');
const { 
    addPaymentMethod, 
    deletePaymentMethod, 
    setDefaultPaymentMethod,
    getPaymentMethods
} = require('../controllers/paymentMethodController');

const router = express.Router();

// Payment method routes
router.post('/payment-methods', addPaymentMethod);
router.delete('/payment-methods/:paymentMethodId', deletePaymentMethod);
router.post('/payment-methods/:paymentMethodId/default', setDefaultPaymentMethod);
router.get('/payment-methods', getPaymentMethods);

module.exports = router;