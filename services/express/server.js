import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import jwt from 'jsonwebtoken';

const { Pool } = pkg;

const app = express();
app.use(express.json());

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:9080',
    'https://deli.oncodir.eu',
    'https://deli-dashboard.oncodir.eu-ailabs.com',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        jwt.verify(authHeader.substring(7), JWT_SECRET, { algorithms: ['HS256'] });
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

app.use((req, res, next) => {
  // console.log(`[${req.method}] ${req.url}`);
  next();
});
app.all('/api/*', (req, res, next) => {
  // console.log(`🔥 Matched wildcard /api route: ${req.method} ${req.url}`);
  next();
});
// Handle OPTIONS requests manually (important!)
// app.options("*", (req, res) => {
//     res.header("Access-Control-Allow-Origin", "http://localhost:5173");
//     res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//     res.header("Access-Control-Allow-Headers", "Content-Type");
//     res.sendStatus(204);
// });
// PostgreSQL Connection
// const pool = new Pool({
//     user: process.env.DB_USER || 'postgres',
//     host: process.env.DB_HOST || 'deli_db_container',
//     database: process.env.DB_NAME || 'deli_db',
//     password: process.env.DB_PASSWORD || 'postgres',
//     port: process.env.DB_PORT || 5433,
// });



const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME ,
    password: process.env.DB_PASSWORD ,
    port: process.env.DB_PORT,
});

if (!process.env.DB_HOST) {
  throw new Error("DB_HOST is not set");
}

// Ensure audit_logs_tbl exists (Spring JPA creates it, but this is a safety net)
pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs_tbl (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        action VARCHAR(50),
        performed_by VARCHAR(100),
        target VARCHAR(100),
        details TEXT
    )
`).catch(err => console.error('Failed to ensure audit_logs_tbl:', err.message));


// Insert new comment with page name
app.post('/submit-text', verifyToken, async (req, res) => {
    const { text, username, page_name } = req.body;

    if (!text || !username || !page_name) {
        return res.status(400).json({ error: 'Valid text, username, and page_name are required' });
    }

    if (text.length > 2000) {
        return res.status(400).json({ error: 'Comment exceeds maximum length of 2000 characters' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO comments_tbl (content, username, page_name) VALUES ($1, $2, $3) RETURNING *`,
            [text, username, page_name] // ✅ Ensure this matches the table columns
        );

        // console.log("✅ Comment inserted into DB:", result.rows[0]);

        res.status(201).json({ message: 'Comment stored successfully', data: result.rows[0] });
    } catch (error) {
        console.error('❌ Error inserting comment:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});



// Proxy: fetch service token from upstream and return it to the authenticated frontend
const fetchBiasToken = async () => {
    const res = await fetch('https://oncodir-datapi.catalink.eu/v1/services/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            service_name: process.env.SERVICE_NAME,
            password: process.env.SERVICE_PASSWORD,
        }),
    });
    if (!res.ok) throw new Error(`Upstream login failed: ${res.status}`);
    const text = await res.text();
    return text.trim().replace(/^"|"$/g, '');
};

app.get('/bias-token', verifyToken, async (req, res) => {
    try {
        const token = await fetchBiasToken();
        res.json({ token });
    } catch (err) {
        console.error('bias-token error:', err.message);
        res.status(502).json({ error: 'Failed to obtain bias token' });
    }
});

app.get('/all-comments/bias-token', verifyToken, async (req, res) => {
    try {
        const token = await fetchBiasToken();
        res.json({ token });
    } catch (err) {
        console.error('bias-token error:', err.message);
        res.status(502).json({ error: 'Failed to obtain bias token' });
    }
});

// Endpoint to clear all comments from the table
app.delete('/clear-comments', verifyToken, async (req, res) => {
    try {
        // SQL query to delete all rows from the comments table
        const result = await pool.query('DELETE FROM comments_tbl');
        // console.log("Cleared all comments from the table");
        res.status(200).json({ message: 'All comments have been cleared successfully.' });
    } catch (error) {
        console.error('Error clearing comments:', error.message);
        res.status(500).json({ error: 'Error clearing comments from the table.' });
    }
});
// Delete a single comment by id (admin/mod only — role verified via DB lookup)
const verifyAdminOrMod = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const payload = jwt.decode(authHeader.substring(7));
        if (!payload?.sub) return res.status(401).json({ error: 'Invalid token' });
        const { rows } = await pool.query(
            `SELECT r.label FROM users_tbl u
             JOIN user_roles_tbl ur ON u.id = ur.user_id
             JOIN roles_tbl r ON ur.role_id = r.id
             WHERE u.username = $1`,
            [payload.sub]
        );
        const roles = rows.map(r => r.label);
        if (!roles.includes('ROLE_ADMIN') && !roles.includes('ROLE_MODERATOR')) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        req.performedBy = payload.sub;
        next();
    } catch {
        return res.status(500).json({ error: 'Role check failed' });
    }
};

const deleteCommentById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM comments_tbl WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Comment not found' });
        const deleted = result.rows[0];
        const details = JSON.stringify({
            content: deleted.content,
            username: deleted.username,
            page_name: deleted.page_name,
            created_at: deleted.created_at,
        });
        await pool.query(
            `INSERT INTO audit_logs_tbl (action, performed_by, target, details, timestamp) VALUES ($1, $2, $3, $4, NOW())`,
            ['COMMENT_DELETED', req.performedBy, `comment#${id}`, details]
        ).catch(err => console.error('Audit log INSERT failed:', err.message));
        res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('Error deleting comment:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
};

app.delete('/comments/:id', verifyToken, verifyAdminOrMod, deleteCommentById);
app.delete('/all-comments/:id', verifyToken, verifyAdminOrMod, deleteCommentById);

// Restore a deleted comment from audit log details JSON
const restoreCommentHandler = async (req, res) => {
    const { details, auditLogId } = req.body;
    let parsed;
    try {
        parsed = typeof details === 'string' ? JSON.parse(details) : details;
    } catch {
        return res.status(400).json({ error: 'Invalid details format' });
    }
    const { content, username, page_name } = parsed ?? {};
    if (!content || !username || !page_name) {
        return res.status(400).json({ error: 'Missing comment fields in details' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO comments_tbl (content, username, page_name) VALUES ($1, $2, $3) RETURNING *`,
            [content, username, page_name]
        );
        await pool.query(
            `INSERT INTO audit_logs_tbl (action, performed_by, target, details, timestamp) VALUES ($1, $2, $3, $4, NOW())`,
            ['COMMENT_RESTORED', req.performedBy, auditLogId ? `audit#${auditLogId}` : null, JSON.stringify({ restoredComment: result.rows[0] })]
        ).catch(err => console.error('Audit log INSERT failed:', err.message));
        if (auditLogId) {
            await pool.query('DELETE FROM audit_logs_tbl WHERE id = $1', [auditLogId])
                .catch(err => console.error('Failed to remove COMMENT_DELETED entry after restore:', err.message));
        }
        res.status(201).json({ message: 'Comment restored', data: result.rows[0] });
    } catch (error) {
        console.error('Error restoring comment:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
};

app.post('/comments/restore', verifyToken, verifyAdminOrMod, restoreCommentHandler);
app.post('/all-comments/restore', verifyToken, verifyAdminOrMod, restoreCommentHandler);

// Permanently delete an audit log entry (mod only)
app.delete('/audit-logs/:id', verifyToken, verifyAdminOrMod, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM audit_logs_tbl WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Audit entry not found' });
        res.status(200).json({ message: 'Audit entry deleted' });
    } catch (error) {
        console.error('Error deleting audit entry:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// Fetch all comments
app.get('/comments', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM comments_tbl ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/all-comments', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM comments_tbl ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/comments/submit-text', verifyToken, async (req, res) => {
    const { text, username, page_name } = req.body;
    if (!text || !username || !page_name) {
        return res.status(400).json({ error: 'Valid text, username, and page_name are required' });
    }
    if (text.length > 2000) {
        return res.status(400).json({ error: 'Comment exceeds maximum length of 2000 characters' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO comments_tbl (content, username, page_name) VALUES ($1, $2, $3) RETURNING *`,
            [text, username, page_name]
        );
        res.status(201).json({ message: 'Comment stored successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Error inserting comment:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});
app.use((req, res, next) => {
    // console.log(`Received request: ${req.method} ${req.url}`);
    // console.log('Headers:', req.headers);
    next();
});




// Save a dashboard for a user (max 6 per user)
app.post('/api/save-dashboard', verifyToken, async (req, res) => {
    const { user_id, dashboard_id, saved_url, page_name } = req.body;

    if (!user_id || !dashboard_id || !saved_url || !page_name) {
        return res.status(400).json({ error: 'Missing user_id, dashboard_id, saved_url or page_name' });
    }

    try {
        const { rows: countRows } = await pool.query(
            'SELECT COUNT(*) FROM saved_graphs WHERE user_id = $1 AND dashboard_id = $2',
            [user_id, dashboard_id]
        );

        const count = parseInt(countRows[0].count);

        if (count >= 6) {
            return res.status(400).json({ error: 'You can only save up to 6 graphs per dashboard.' });
        }

        const result = await pool.query(
            'INSERT INTO saved_graphs (user_id, dashboard_id, saved_url, page_name) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, dashboard_id, saved_url, page_name]
        );

        res.status(201).json({ message: 'Graph saved successfully.', data: result.rows[0] });
    } catch (error) {
        console.error('Error saving graph:', error.message);
        res.status(500).json({ error: 'Database error while saving graph' });
    }
});


app.get('/api/user-dashboards/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const { rows: dashboards } = await pool.query(
      'SELECT * FROM dashboards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    for (const dashboard of dashboards) {
      const { rows: graphs } = await pool.query(
        'SELECT * FROM saved_graphs WHERE dashboard_id = $1 ORDER BY created_at DESC',
        [dashboard.id]
      );
      dashboard.graphs = graphs;
    }

    res.status(200).json(dashboards);
  } catch (err) {
    console.error('Error fetching dashboards:', err.stack || err);
    res.status(500).json({ error: 'Error fetching dashboards' });
  }
});




// Delete a dashboard and all its associated graphs
app.delete('/api/delete-dashboard-collection/:dashboardId', verifyToken, async (req, res) => {
    // console.log("🔥 DELETE DASHBOARD COLLECTION HIT", req.params.dashboardId);
    const { dashboardId } = req.params;

    try {
        // Delete associated graphs first
        await pool.query('DELETE FROM saved_graphs WHERE dashboard_id = $1', [dashboardId]);

        // Then delete the dashboard itself
        await pool.query('DELETE FROM dashboards WHERE id = $1', [dashboardId]);

        res.status(200).json({ message: 'Dashboard and associated graphs deleted successfully.' });
    } catch (err) {
        console.error('Error deleting dashboard collection:', err.message);
        res.status(500).json({ error: 'Error deleting dashboard and graphs' });
    }
});


// Delete a saved dashboard by ID
app.delete('/api/delete-dashboard/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
   // console.log("🔥 DELETE DASHBOARD COLLECTION HIT", id );
    try {
        await pool.query('DELETE FROM saved_graphs WHERE id = $1', [id]);
        res.status(204).send(); // 204 = No Content, which is OK
    } catch (error) {
        console.error('Error deleting graph:', error.message);
        res.status(500).json({ error: 'Database error while deleting graph' });
    }
});






app.patch('/api/rename-dashboard/:dashboardId', verifyToken, async (req, res) => {
    const { dashboardId } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Missing new dashboard name' });
    }

    const id = parseInt(dashboardId, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid dashboard ID' });
    }

    try {
        await pool.query('UPDATE dashboards SET name = $1 WHERE id = $2', [name, id]);
        res.status(200).json({ message: 'Dashboard renamed successfully' });
    } catch (err) {
        console.error('Error renaming dashboard:', err.message);
        res.status(500).json({ error: 'Error renaming dashboard' });
    }
});


// Create a new dashboard (max 3 per user)
app.post('/api/create-dashboard', verifyToken, async (req, res) => {
    const { user_id, name } = req.body;

    if (!user_id || !name) {
        return res.status(400).json({ error: 'Missing user_id or name' });
    }

    try {
        const { rows: countRows } = await pool.query(
            'SELECT COUNT(*) FROM dashboards WHERE user_id = $1',
            [user_id]
        );

        if (parseInt(countRows[0].count) >= 3) {
            return res.status(400).json({ error: 'You can only have up to 3 dashboards.' });
        }

        const result = await pool.query(
            'INSERT INTO dashboards (user_id, name) VALUES ($1, $2) RETURNING *',
            [user_id, name]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error creating dashboard' });
    }
});


// Save a graph into a specific dashboard (max 6 per dashboard)
app.post('/api/save-graph', verifyToken, async (req, res) => {
    const { dashboardId, savedUrl, pageName, user_id } = req.body;
    

    if (!dashboardId || !savedUrl) {
        return res.status(400).json({ error: 'Missing dashboard ID or graph URL' });
    }

    if (!user_id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        await pool.query(
            `INSERT INTO saved_graphs (dashboard_id, saved_url, page_name, user_id)
             VALUES ($1, $2, $3, $4)`,
            [dashboardId, savedUrl, pageName, user_id]
        );
        return res.status(200).json({ message: 'Graph saved successfully' });  // ✅ IMPORTANT
    } catch (err) {
        console.error('Database error saving graph:', err);
        return res.status(500).json({ error: 'Database error saving graph' });  // ✅ IMPORTANT
    }
});












// Start Server
const PORT = process.env.PORT || 9080;
app.listen(PORT,'0.0.0.0', () => {

    console.log(`Server running on port ${PORT}`);
});



