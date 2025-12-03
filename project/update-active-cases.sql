-- Update some emergency requests to Active status for testing
UPDATE emergency_project.emergency_requests 
SET status = 'Active' 
WHERE id IN (
  SELECT id 
  FROM emergency_project.emergency_requests 
  LIMIT 5
);

-- Verify the update
SELECT id, status, description, "createdAt" 
FROM emergency_project.emergency_requests 
WHERE status = 'Active'
ORDER BY "createdAt" DESC;
