// GHL Contact
export interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string[];
  customFields: Record<string, string>;
  dateAdded: string;
}

// GHL Pipeline Stage
export interface GHLPipelineStage {
  id: string;
  name: string;
  position: number;
}

// GHL Opportunity
export interface GHLOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  monetaryValue: number;
  contactId: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

// Pipeline funnel data
export interface PipelineFunnelStage {
  name: string;
  count: number;
  value: string;
  color: string;
}
