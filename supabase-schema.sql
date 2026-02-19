-- UAE7Guard Database Schema
-- Run this in Supabase SQL Editor to create all required tables.
-- Requires: uuid-ossp extension (enabled by default on Supabase)

-- ============================================================
-- 1. users — User accounts and subscription info
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  wallet_address TEXT,
  display_name TEXT,
  avatar_url TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  scans_today INT NOT NULL DEFAULT 0,
  scans_reset_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. user_reputation — Trust scores and community rank
-- ============================================================
CREATE TABLE IF NOT EXISTS user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trust_score INT NOT NULL DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  rank TEXT NOT NULL DEFAULT 'newcomer',
  reports_submitted INT NOT NULL DEFAULT 0,
  reports_verified INT NOT NULL DEFAULT 0,
  scans_performed INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- ============================================================
-- 3. scam_reports — Community-submitted scam reports
-- ============================================================
CREATE TABLE IF NOT EXISTS scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_address TEXT NOT NULL,
  chain_id INT NOT NULL DEFAULT 1,
  category TEXT NOT NULL CHECK (category IN ('phishing', 'rug_pull', 'honeypot', 'address_poisoning', 'fake_nft', 'ponzi', 'other')),
  description TEXT,
  evidence_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'investigating')),
  verified_by UUID REFERENCES users(id),
  risk_score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scam_reports_address ON scam_reports(reported_address);
CREATE INDEX IF NOT EXISTS idx_scam_reports_status ON scam_reports(status);

-- ============================================================
-- 4. alerts — User notification queue
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('address_poisoning', 'suspicious_approval', 'high_risk_tx', 'rug_pull', 'nft_scam', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  related_address TEXT,
  chain_id INT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id, read);

-- ============================================================
-- 5. watchlist — Addresses users want to monitor
-- ============================================================
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  chain_id INT NOT NULL DEFAULT 1,
  label TEXT,
  notify_on_tx BOOLEAN NOT NULL DEFAULT true,
  notify_on_risk_change BOOLEAN NOT NULL DEFAULT true,
  last_risk_score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, address, chain_id)
);

-- ============================================================
-- 6. security_logs — Audit trail for all security events
-- ============================================================
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_logs_user ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_action ON security_logs(action);

-- ============================================================
-- 7. live_monitoring — Real-time wallet monitoring sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS live_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  chain_id INT NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  last_tx_hash TEXT,
  alert_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, address, chain_id)
);

-- ============================================================
-- 8. monitoring_alerts — Transaction alerts from monitoring
-- ============================================================
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitoring_id UUID NOT NULL REFERENCES live_monitoring(id) ON DELETE CASCADE,
  tx_hash TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  value TEXT,
  risk_score INT,
  risk_level TEXT,
  alert_type TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_monitoring ON monitoring_alerts(monitoring_id);

-- ============================================================
-- 9. escrow_transactions — Smart lock / escrow transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  buyer_address TEXT NOT NULL,
  seller_address TEXT NOT NULL,
  chain_id INT NOT NULL DEFAULT 1,
  amount TEXT NOT NULL,
  token_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'released', 'disputed', 'refunded', 'expired')),
  contract_address TEXT,
  tx_hash TEXT,
  release_conditions JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. slippage_calculations — Token slippage analysis records
-- ============================================================
CREATE TABLE IF NOT EXISTS slippage_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  token_address TEXT NOT NULL,
  chain_id INT NOT NULL DEFAULT 1,
  token_symbol TEXT,
  buy_slippage NUMERIC(10, 4),
  sell_slippage NUMERIC(10, 4),
  liquidity_usd NUMERIC(18, 2),
  is_honeypot BOOLEAN NOT NULL DEFAULT false,
  analysis JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_slippage_token ON slippage_calculations(token_address, chain_id);

-- ============================================================
-- 11. conversations — AI chat history
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  message_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. messages — Individual chat messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

-- ============================================================
-- 13. encrypted_audit_logs — Legal-grade audit trail
-- ============================================================
CREATE TABLE IF NOT EXISTS encrypted_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  encrypted_payload TEXT NOT NULL,
  iv TEXT NOT NULL,
  hash TEXT NOT NULL,
  previous_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON encrypted_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON encrypted_audit_logs(user_id);

-- ============================================================
-- 14. sessions — Session storage for auth
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ============================================================
-- Row Level Security (RLS) policies
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE slippage_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own row
CREATE POLICY users_own ON users FOR ALL USING (auth.uid() = id);

-- Reputation: users can read their own
CREATE POLICY reputation_own ON user_reputation FOR SELECT USING (auth.uid() = user_id);

-- Scam reports: anyone can read verified, reporters can manage their own
CREATE POLICY reports_read ON scam_reports FOR SELECT USING (status = 'verified' OR reporter_id = auth.uid());
CREATE POLICY reports_insert ON scam_reports FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Alerts: users see their own
CREATE POLICY alerts_own ON alerts FOR ALL USING (auth.uid() = user_id);

-- Watchlist: users manage their own
CREATE POLICY watchlist_own ON watchlist FOR ALL USING (auth.uid() = user_id);

-- Security logs: users read their own
CREATE POLICY logs_own ON security_logs FOR SELECT USING (auth.uid() = user_id);

-- Live monitoring: users manage their own
CREATE POLICY monitoring_own ON live_monitoring FOR ALL USING (auth.uid() = user_id);

-- Monitoring alerts: users see alerts from their monitors
CREATE POLICY monitoring_alerts_own ON monitoring_alerts FOR SELECT
  USING (monitoring_id IN (SELECT id FROM live_monitoring WHERE user_id = auth.uid()));

-- Escrow: buyers and sellers see their own
CREATE POLICY escrow_own ON escrow_transactions FOR ALL
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Slippage: users see their own calculations
CREATE POLICY slippage_own ON slippage_calculations FOR ALL USING (auth.uid() = user_id);

-- Conversations: users manage their own
CREATE POLICY conversations_own ON conversations FOR ALL USING (auth.uid() = user_id);

-- Messages: users see messages in their conversations
CREATE POLICY messages_own ON messages FOR ALL
  USING (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));

-- Audit logs: read-only for own records
CREATE POLICY audit_own ON encrypted_audit_logs FOR SELECT USING (auth.uid() = user_id);

-- Sessions: users manage their own
CREATE POLICY sessions_own ON sessions FOR ALL USING (auth.uid() = user_id);
