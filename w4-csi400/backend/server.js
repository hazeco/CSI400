require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const apiAuthRoutes = require('./routes/apiAuthRoutes');
const apiProtectRoutes = require('./routes/apiProtectRoutes');
const apiPublicRoutes = require('./routes/apiPublicRoutes');
const apiPrivateRoutes = require('./routes/apiPrivateRoutes');
const apiOAuthRoutes = require('./routes/apiOAuthRoutes');

const port = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

// Default Route (หากเปิดผ่าน API)
app.get('/api-status', (req, res) => {
    res.send('Avengers Quinjet Web Service API is running');
});

// Using Router
app.use('/api/auth', apiAuthRoutes); // Example: localhost:3000/api/auth/login
app.use('/api/public', apiPublicRoutes); // Example: localhost:3000/api/public/info
app.use('/api/protect', apiProtectRoutes); // Example: localhost:3000/api/protect/profile
app.use('/api/private', apiPrivateRoutes); // Example: localhost:3000/api/private/users
app.use('/auth', apiOAuthRoutes); // OAuth: localhost:3000/auth/github

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});