-- KPI Snapshots: Daily metric snapshots for trend tracking
CREATE TABLE kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  function_name TEXT NOT NULL, -- Marketing, Sales, Onboarding, Hosting, Finance
  kpi_name TEXT NOT NULL,
  value DECIMAL NOT NULL,
  target DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpi_snapshots_date ON kpi_snapshots(date);
CREATE INDEX idx_kpi_snapshots_function ON kpi_snapshots(function_name);

-- Pipeline Status: Lead/deal stage tracking
CREATE TABLE pipeline_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL, -- Airtable record ID
  source TEXT NOT NULL, -- 'airtable', 'ghl'
  stage TEXT NOT NULL, -- Lead, Qualified, Meeting, Proposal, Signed
  opportunity_score INTEGER,
  property_address TEXT,
  owner_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pipeline_stage ON pipeline_status(stage);
CREATE UNIQUE INDEX idx_pipeline_external ON pipeline_status(source, external_id);

-- System Health: Automation run logs
CREATE TABLE system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL, -- 'airtable', 'ghl', 'hostaway', 'endato', 'airroi'
  status TEXT NOT NULL, -- 'healthy', 'warning', 'error'
  last_run TIMESTAMPTZ,
  error_message TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_health_name ON system_health(system_name);

-- Enable Row Level Security
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust as needed)
CREATE POLICY "Allow all for authenticated" ON kpi_snapshots FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON pipeline_status FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON system_health FOR ALL USING (true);
