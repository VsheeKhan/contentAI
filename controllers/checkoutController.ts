import { NextApiRequest, NextApiResponse } from 'next';
import { findUserById } from "../services/userService";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export async function checkoutHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { userId } = req.user as { userId: string }; 
        const userInfo = await findUserById(userId);
        const { priceId } = req.body;
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'subscription',
                customer : userInfo?.stripeClientId,
                line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cancel`,
            });
            console.log(session);
        res.status(200).json({ sessionId: session.id });
        } catch (error) {
            res.status(500).json({ error: 'Unable to create session' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end('Method Not Allowed');
    }
}
