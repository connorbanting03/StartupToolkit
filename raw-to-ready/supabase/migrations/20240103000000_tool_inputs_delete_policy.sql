-- Allow users to delete their own tool inputs
CREATE POLICY "Users can delete own tool inputs"
  ON tool_inputs FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );
