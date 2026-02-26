CREATE TABLE IF NOT EXISTS payment_orders (
  id BIGSERIAL PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,
  player_id UUID NOT NULL REFERENCES players(id),
  plan_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'cny',
  lives_gain INTEGER NOT NULL,
  channel TEXT NOT NULL DEFAULT 'stripe',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  paid_lives_snapshot INTEGER,
  error_message TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_player_id ON payment_orders(player_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_session_id ON payment_orders(stripe_session_id);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_payment_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_orders_updated_at ON payment_orders;
CREATE TRIGGER trg_payment_orders_updated_at
BEFORE UPDATE ON payment_orders
FOR EACH ROW
EXECUTE FUNCTION set_payment_orders_updated_at();

CREATE TABLE IF NOT EXISTS player_memberships (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('monthly', 'lifetime')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_memberships_type ON player_memberships(membership_type);
CREATE INDEX IF NOT EXISTS idx_player_memberships_expires_at ON player_memberships(expires_at);

CREATE OR REPLACE FUNCTION set_player_memberships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_player_memberships_updated_at ON player_memberships;
CREATE TRIGGER trg_player_memberships_updated_at
BEFORE UPDATE ON player_memberships
FOR EACH ROW
EXECUTE FUNCTION set_player_memberships_updated_at();
