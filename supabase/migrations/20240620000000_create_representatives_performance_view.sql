-- Create a view for representative performance metrics
CREATE OR REPLACE VIEW representatives_performance_view AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.role,
    u.created_at,
    u.auth_id,
    u.last_sign_in_at,
    u.temp_password,
    u.invited_by,
    -- Count of assigned companies
    COALESCE(
        (SELECT COUNT(*) FROM companies c WHERE c.assigned_rep = u.id),
        0
    ) AS assigned_companies,
    -- Count of assigned proposals
    COALESCE(
        (SELECT COUNT(*) FROM proposals p WHERE p.assigned_rep = u.id),
        0
    ) AS assigned_proposals,
    -- Total revenue from accepted proposals
    COALESCE(
        (SELECT SUM(p.total_price) 
         FROM proposals p 
         WHERE p.assigned_rep = u.id 
         AND p.status = 'Accepted'),
        0
    ) AS total_revenue,
    -- Conversion rate: Accepted proposals / Total proposals
    CASE 
        WHEN (SELECT COUNT(*) FROM proposals p WHERE p.assigned_rep = u.id) > 0 
        THEN ROUND(
            (CAST((SELECT COUNT(*) FROM proposals p WHERE p.assigned_rep = u.id AND p.status = 'Accepted') AS numeric) / 
             CAST((SELECT COUNT(*) FROM proposals p WHERE p.assigned_rep = u.id) AS numeric)) * 100
        )
        ELSE 0
    END AS conversion_rate,
    -- Last activity timestamp (from most recent proposal)
    COALESCE(
        (SELECT TO_CHAR(p.created_at, 'YYYY-MM-DD')
         FROM proposals p 
         WHERE p.assigned_rep = u.id
         ORDER BY p.created_at DESC
         LIMIT 1),
        TO_CHAR(COALESCE(u.last_sign_in_at, u.created_at), 'YYYY-MM-DD')
    ) AS last_activity
FROM 
    users u
ORDER BY 
    u.name;

-- Add comment to the view
COMMENT ON VIEW representatives_performance_view IS 'View that displays representative performance metrics including assigned companies, proposals, revenue, and conversion rates'; 
