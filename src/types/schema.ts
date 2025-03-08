export type Deal = {
  id: string;
  name: string;
  value: number;
  stage: string;
  closing_date: string;
  contact_id?: string;
  company?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  prospect_id?: string;
  address?: string;
  owner?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type Company = {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type Lead = {
  id: string;
  prospect_id: string;
  business_name: string;
  contact_name: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  owner?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export const PIPELINE_STAGES = [
  "Contact Made",
  "Quote Sent",
  "Deal Closed",
  "Deal Lost",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];
