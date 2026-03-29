# MF Medical Supplies — Setup Guide
# =====================================
# Follow these steps IN ORDER to get your store live.
# Takes about 30-45 minutes total.
# =====================================

STEP 1 — Get a Stripe Account (for payments)
----------------------------------------------
1. Go to https://stripe.com and click "Start now"
2. Create a free account
3. Once inside, go to Developers → API Keys
4. Copy your "Secret key" (starts with sk_test_ for testing)


STEP 2 — Set up Supabase Database
-----------------------------------
1. Log into https://supabase.com and open your project
2. Click "SQL Editor" in the left sidebar
3. Paste and run ALL of this SQL:

  create table products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    brand text,
    category text,
    price decimal(10,2) not null default 0,
    stock integer default 0,
    badge text default '',
    emoji text default '💊',
    description text,
    active boolean default true,
    created_at timestamp with time zone default now()
  );

  create table orders (
    id uuid default gen_random_uuid() primary key,
    stripe_session_id text unique,
    customer_email text,
    customer_name text,
    shipping_address jsonb,
    items jsonb,
    total decimal(10,2),
    status text default 'pending',
    created_at timestamp with time zone default now()
  );

  alter table products enable row level security;
  create policy "Public read products" on products for select using (active = true);
  alter table orders enable row level security;

4. Go to Settings → API in Supabase. Copy:
   - Project URL (https://xxxxx.supabase.co)
   - "anon public" key
   - "service_role" key (KEEP THIS SECRET)


STEP 3 — Edit public/index.html
---------------------------------
Open public/index.html in Notepad.
Find these 2 lines near the top and replace with your Supabase values:

  const SUPABASE_URL = 'YOUR_SUPABASE_URL';
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';


STEP 4 — Deploy to Vercel
---------------------------
1. Go to https://vercel.com and sign in
2. Click "Add New Project" → Upload this folder (mf-medical)
3. BEFORE clicking Deploy, open "Environment Variables" and add:

   STRIPE_SECRET_KEY      = sk_test_xxxx
   STRIPE_WEBHOOK_SECRET  = whsec_xxxx  (get this in Step 5)
   SUPABASE_URL           = https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY   = your supabase service_role key
   ADMIN_PASSWORD         = choose a strong password

4. Click Deploy. Your store will be live in ~1 minute!


STEP 5 — Set up Stripe Webhook
--------------------------------
1. In Stripe → Developers → Webhooks → "Add endpoint"
2. URL: https://YOUR-VERCEL-URL.vercel.app/api/webhook
3. Event: checkout.session.completed
4. Copy the "Signing secret" (whsec_...)
5. Add it as STRIPE_WEBHOOK_SECRET in Vercel → Settings → Environment Variables
6. Redeploy on Vercel (Settings → Deployments → Redeploy)


STEP 6 — Access Your Admin Panel
----------------------------------
URL:      https://YOUR-VERCEL-URL.vercel.app/admin.html
Password: whatever you set as ADMIN_PASSWORD

From the admin panel you can:
✓ Add / edit / delete products
✓ Update stock quantities  
✓ Show or hide products from the store
✓ View all orders and update their status


FILE STRUCTURE
--------------
mf-medical/
├── public/
│   ├── index.html     ← Main store (edit Supabase keys here)
│   ├── admin.html     ← Admin dashboard
│   └── success.html   ← Order confirmation page
├── api/
│   ├── checkout.js    ← Stripe payment handler
│   ├── admin.js       ← Admin API
│   └── webhook.js     ← Records orders from Stripe
├── package.json
├── vercel.json
└── SETUP_GUIDE.md     ← This file
