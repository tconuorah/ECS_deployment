const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { CORS_ORIGIN } = require('./config');

console.log(require('./config'));
console.log(CORS_ORIGIN);

const ID = uuidv4();
const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());

// Basic CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});


// Health for TG
app.get('/health', (_, res) => res.status(200).json({ ok: true, id: ID }));

// Explicit API paths
app.get('/api/status', (_, res) => res.json({ message: `SUCCESS ${ID}` }));
app.get('/api/*', (_, res) => res.json({ message: `SUCCESS ${ID}` })); // any other API path

app.listen(PORT, '0.0.0.0', () => console.log(`Backend started on ${PORT}`));