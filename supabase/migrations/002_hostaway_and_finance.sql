-- Hostaway property filter settings
CREATE TABLE IF NOT EXISTS hostaway_properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  include_in_metrics BOOLEAN DEFAULT true,
  last_synced TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hostaway metrics snapshots (cached data, refresh every 6 hours)
CREATE TABLE IF NOT EXISTS hostaway_metrics_snapshots (
  id SERIAL PRIMARY KEY,
  property_id TEXT REFERENCES hostaway_properties(id),
  snapshot_date DATE NOT NULL,
  pm_commission DECIMAL(10,2),
  occupancy_rate DECIMAL(5,2),
  bookings_count INTEGER,
  avg_review_rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id, snapshot_date)
);

-- Expense sources (categories)
CREATE TABLE IF NOT EXISTS expense_sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_recurring BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Monthly expense entries
CREATE TABLE IF NOT EXISTS expense_entries (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES expense_sources(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of month (YYYY-MM-01)
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_id, month)
);

-- Indexes for performance
CREATE INDEX idx_hostaway_properties_include ON hostaway_properties(include_in_metrics);
CREATE INDEX idx_hostaway_snapshots_date ON hostaway_metrics_snapshots(snapshot_date DESC);
CREATE INDEX idx_expense_entries_month ON expense_entries(month DESC);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hostaway_properties_updated_at
  BEFORE UPDATE ON hostaway_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_sources_updated_at
  BEFORE UPDATE ON expense_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_entries_updated_at
  BEFORE UPDATE ON expense_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
