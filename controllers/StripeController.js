const stripe = require('../config/stripe');
const { User, Subscription, Product } = require("../config/relation");

class StripeController {

    constructor() {
        this.subscribeBasic = this.subscribeBasic.bind(this);
        this.subscribePro = this.subscribePro.bind(this);
        this.subscribeBusiness = this.subscribeBusiness.bind(this);
        this.createSubscription = this.createSubscription.bind(this);
        this.calculateEndDate = this.calculateEndDate.bind(this);

    }
    
    // Subscribe to Basic Plan
    async subscribeBasic(req, res) {
        const planId = process.env.STRIPE_BASIC_PLAN_ID;
        return this.createSubscription(req, res, planId, 'Basic');
    }

    // Subscribe to Pro Plan
    async subscribePro(req, res) {
        const planId = process.env.STRIPE_PRO_PLAN_ID;
        return this.createSubscription(req, res, planId, 'Pro');
    }

    // Subscribe to Business Plan
    async subscribeBusiness(req, res) {
        const planId = process.env.STRIPE_BUSINESS_PLAN_ID;
        return this.createSubscription(req, res, planId, 'Business');
    }
    
    async subscribeFree(req, res) {
        try {
            const { userId } = req.body;

            // Retrieve the user by ID
            const user = await User.findByPk(userId);

            // Check if user exists
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Update the user's plan to Basic
            await user.update({ plan: 'Free' });

            res.status(200).json({
                message: 'User plan updated to Free successfully',
                user,
                status: 'success'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while updating the user plan' });
        }
    }

    // Generic subscription creation method
    async createSubscription(req, res, planId,planName) {
        try {
            const { userId } = req.body;
    
            // Retrieve the user by ID
            const user = await User.findByPk(userId);
            
            // Check if user exists
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            let stripeCustomerId = user.stripeCustomerId;
    
            // If the user does not have a Stripe customer ID, create one
            if (!stripeCustomerId) {
                const customer = await stripe.customers.create({
                    email: user.email,
                    name: `${user.name} ${user.last_name}`
                });
                stripeCustomerId = customer.id;
                await user.update({ stripeCustomerId });
            }
    
            // Create a new Checkout session
            const session = await stripe.checkout.sessions.create({
                customer: stripeCustomerId,
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: planId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${process.env.FRONTEND_URL}/register/subscription-needs`,
                cancel_url: `${process.env.FRONTEND_URL}/register/choose-plan`,
            });
console.log("============================================");
            console.log(session);

            await user.update({ plan: planName });

            await Subscription.create({
                user_id: user.id,
                product_id: planId,  // Assuming product_id corresponds to the plan ID
                stripe_subscription_id: session.customer, // The subscription ID returned by Stripe
                status: 'active',
                start_date: new Date(), // Set the start date of the subscription
                end_date: this.calculateEndDate(planName), // Assuming you have a function to calculate the subscription end date
            });
    
            // Respond with the session URL to redirect the user to Stripe checkout
            res.json({ url: session.url });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    

    async calculateEndDate(planName) {
        const currentDate = new Date();
        let endDate = new Date(currentDate);
        
        // Example logic: set the subscription end date based on the plan
        if (planName === 'Basic') {
            endDate.setFullYear(endDate.getFullYear() + 1); // 1 year for Basic
        } else if (planName === 'Pro') {
            endDate.setFullYear(endDate.getFullYear() + 1); // 1 year for Pro
        } else if (planName === 'Business') {
            endDate.setFullYear(endDate.getFullYear() + 2); // 2 years for Business
        }
        
        return endDate;
    }

    async getUserPlan(req, res) {
        try {
            const { userId } = req.body;

            // Retrieve the user by ID
            const user = await User.findByPk(userId);

            // Check if user exists
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Return the user's current plan
            res.status(200).json({
                plan: user.plan,
                message: 'User plan retrieved successfully',
                status: 'success'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while retrieving the user plan' });
        }
    }


   

    // Check current subscription status
    async checkSubscription(req, res) {
        try {
            const { userId } = req.body;
            const subscription = await Subscription.findOne({ 
                where: { user_id: userId, status: 'active' }
            });

            if (!subscription) {
                return res.status(404).json({ message: 'No active subscription found' });
            }

            res.json({
                subscription: {
                    status: subscription.status,
                    start_date: subscription.start_date,
                    end_date: subscription.end_date,
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred' });
        }
    }
}

module.exports = new StripeController();
