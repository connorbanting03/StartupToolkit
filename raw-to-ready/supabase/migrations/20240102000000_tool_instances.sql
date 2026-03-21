-- Add label column for multiple tool instances per project
ALTER TABLE tool_inputs ADD COLUMN IF NOT EXISTS label text;
