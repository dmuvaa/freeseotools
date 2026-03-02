-- Subscription Management Schema

-- Ensure organizations table has subscription fields
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'trialing'
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS limits_projects int DEFAULT 3,
ADD COLUMN IF NOT EXISTS limits_audits_per_month int DEFAULT 10;

-- Comments
COMMENT ON COLUMN organizations.plan_tier IS 'Subscription tier: free, starter, pro, agency, enterprise';
COMMENT ON COLUMN organizations.subscription_status IS 'Status from payment provider (e.g. Stripe)';
