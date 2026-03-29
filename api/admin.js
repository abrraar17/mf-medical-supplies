const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mfmedical2026';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, action, data } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  try {
    switch (action) {

      case 'getProducts': {
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.json({ products });
      }

      case 'addProduct': {
        const { error, data: product } = await supabase
          .from('products')
          .insert([data])
          .select()
          .single();
        if (error) throw error;
        return res.json({ product });
      }

      case 'updateProduct': {
        const { id, ...fields } = data;
        const { error, data: product } = await supabase
          .from('products')
          .update(fields)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.json({ product });
      }

      case 'deleteProduct': {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', data.id);
        if (error) throw error;
        return res.json({ success: true });
      }

      case 'getOrders': {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) throw error;
        return res.json({ orders });
      }

      case 'updateOrderStatus': {
        const { error } = await supabase
          .from('orders')
          .update({ status: data.status })
          .eq('id', data.id);
        if (error) throw error;
        return res.json({ success: true });
      }

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    console.error('Admin error:', err);
    res.status(500).json({ error: err.message });
  }
};
