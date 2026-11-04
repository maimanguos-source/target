import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';

const app = express();
const port = Number(process.env.PORT) || 3001;
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY.trim())
  : null;

app.use(express.json());

app.post('/api/create-checkout-session', async (_req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe no está configurado.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'TargetSticker' },
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['ES'],
      },
      success_url: 'https://targetsticker.us.ci/exito',
      cancel_url: 'https://targetsticker.us.ci/cancelado',
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe] No se pudo crear la sesión de checkout:', error.message);
    return res.status(500).json({ error: 'No se pudo crear la sesión de pago.' });
  }
});

app.listen(port, () => {
  console.log(`API de checkout disponible en http://localhost:${port}`);
});