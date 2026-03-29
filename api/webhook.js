const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send('Webhook Error: ' + err.message);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    await supabase.from('orders').insert([{
      stripe_session_id: session.id,
      customer_email: session.customer_details?.email || '',
      customer_name: session.customer_details?.name || '',
      shipping_address: session.shipping_details?.address || {},
      items: lineItems.data,
      total: session.amount_total / 100,
      status: 'paid',
    }]);
  }

  res.json({ received: true });
};
