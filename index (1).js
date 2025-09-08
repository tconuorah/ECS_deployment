const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { CORS_ORIGIN } = require('./config');

console.log(require('./config'));
console.log(CORS_ORIGIN);

const ID = uuidv4();
const PORT = 8080;

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

// Catch-all GET route
app.get('/*', (req, res) => {
    console.log(`${new Date().toISOString()} GET`);
    res.json({ message: `SUCCESS ${ID}` });
});

app.listen(PORT, () => {
    console.log(`Backend started on ${PORT}. Press Ctrl+C to exit`);
});
