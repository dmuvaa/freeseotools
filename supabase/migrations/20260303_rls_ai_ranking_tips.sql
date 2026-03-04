-- Execute this in the Supabase SQL Editor to allow the frontend to read the ai_ranking_tips table

ALTER TABLE "public"."ai_ranking_tips" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view AI ranking tips for their projects"
ON "public"."ai_ranking_tips"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects p 
    JOIN profiles pr ON p.org_id = pr.org_id
    WHERE p.id = ai_ranking_tips.project_id 
    AND pr.id = auth.uid()
  )
);
