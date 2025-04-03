import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
app.use(express.json());


// ✅ Fix CORS: Allow requests from React frontend
app.use(cors({
    origin: '*', // Change to your frontend URL for security (e.g., http://localhost:5173)
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));
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
// Start Server
const PORT = process.env.PORT || 9080;
app.listen(PORT,'0.0.0.0', () => {

    console.log(`Server running on port ${PORT}`);
});
