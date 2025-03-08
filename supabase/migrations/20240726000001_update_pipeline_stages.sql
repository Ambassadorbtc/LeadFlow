-- Update the pipeline stages to match the new requirements

-- First, update existing deals to use the new stages
UPDATE public.deals
SET stage = CASE
    WHEN stage = 'Qualification' OR stage = 'Needs Analysis' THEN 'Contact Made'
    WHEN stage = 'Value Proposition' OR stage = 'Proposal' THEN 'Quote Sent'
    WHEN stage = 'Negotiation' THEN 'Chasing'
    ELSE stage
END;

-- Make sure all deals have valid stages
UPDATE public.deals
SET stage = 'Contact Made'
WHERE stage NOT IN ('Contact Made', 'Quote Sent', 'Chasing', 'Deal Closed', 'Deal Lost');
