import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
app.use(express.json());

// ✅ Fix CORS: Allow requests from React frontend
app.use(cors({
    origin: '*', // Change to your frontend URL for security (e.g., http://localhost:5173)
    methods: ['GET', 'POST', 'OPTIONS','DELETE','PATCH','INSERT'],
    allowedHeaders: ['Content-Type'],
}));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});
app.all('/api/*', (req, res, next) => {
  console.log(`🔥 Matched wildcard /api route: ${req.method} ${req.url}`);
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
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'deli_db_container',
    database: process.env.DB_NAME || 'deli_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5433,
});

// Insert new comment with page name
app.post('/submit-text', async (req, res) => {
    console.log("🔍 Received request body:", req.body);

    const { text, username, page_name } = req.body;

    console.log("✅ Extracted values -> text:", text, "username:", username, "page_name:", page_name);

    if (!text || !username || !page_name) {
        return res.status(400).json({ error: 'Valid text, username, and page_name are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO comments_tbl (content, username, page_name) VALUES ($1, $2, $3) RETURNING *`,
            [text, username, page_name] // ✅ Ensure this matches the table columns
        );

        console.log("✅ Comment inserted into DB:", result.rows[0]); // Log the stored data

        res.status(201).json({ message: 'Comment stored successfully', data: result.rows[0] });
    } catch (error) {
        console.error('❌ Error inserting comment:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});



// Endpoint to clear all comments from the table
app.delete('/clear-comments', async (req, res) => {
    try {
        // SQL query to delete all rows from the comments table
        const result = await pool.query('DELETE FROM comments_tbl');
        console.log("Cleared all comments from the table");
        res.status(200).json({ message: 'All comments have been cleared successfully.' });
    } catch (error) {
        console.error('Error clearing comments:', error.message);
        res.status(500).json({ error: 'Error clearing comments from the table.' });
    }
});
// Fetch all comments
app.get('/comments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM comments_tbl ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Database error' });
    }
});
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});




// Save a dashboard for a user (max 6 per user)
app.post('/api/save-dashboard', async (req, res) => {
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


app.get('/api/user-dashboards/:userId', async (req, res) => {
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
app.delete('/api/delete-dashboard-collection/:dashboardId', async (req, res) => {
    console.log("🔥 DELETE DASHBOARD COLLECTION HIT", req.params.dashboardId);
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
app.delete('/api/delete-dashboard/:id', async (req, res) => {
    const { id } = req.params;
   console.log("🔥 DELETE DASHBOARD COLLECTION HIT", id );
    try {
        await pool.query('DELETE FROM saved_graphs WHERE id = $1', [id]);
        res.status(204).send(); // 204 = No Content, which is OK
    } catch (error) {
        console.error('Error deleting graph:', error.message);
        res.status(500).json({ error: 'Database error while deleting graph' });
    }
});






app.patch('/api/rename-dashboard/:dashboardId', async (req, res) => {
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
app.post('/api/create-dashboard', async (req, res) => {
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
app.post('/api/save-graph', async (req, res) => {
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



