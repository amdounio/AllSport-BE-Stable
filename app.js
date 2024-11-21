const express = require('express');
const userRoutes = require('./routes/userRoutes');
const sequelize = require('./config/db');
const cors = require('cors'); // Import CORS
const templateRoutes = require('./routes/templateRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const matchRoutes = require('./routes/matchRoutes');
const https = require('https'); 
const fs = require('fs'); 
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const imageRoutes = require('./routes/imageRoutes');
const mediathequesRoutes = require('./routes/MediathequesRoutes');

const stripeRoutes = require('./routes/stripeRoutes');
const stripeWebhook = require('./routes/stripeWebhook');  // adjust the path based on where stripeWebhook.js is located


const app = express();
//const app = express();
const corsOptions = {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
// Middleware
app.use(express.json());
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/subscriptions', stripeRoutes); // Use your subscription routes
app.use('/api/stripe', stripeWebhook); // Mount your webhook route under '/api/stripe'
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public/ligues/images', express.static(path.join(__dirname, 'public', 'ligues', 'images')));

app.use('/api/generator', imageRoutes);



app.use('/api/mediatheques', mediathequesRoutes); // Use your subscription routes

// Sync Sequelize models with MySQL
sequelize.sync()
    .then(() => console.log('Database & tables synced...'))
    .catch(err => console.log('Error syncing tables: ' + err));

// HTTPS options
const options = {
    key: fs.readFileSync("/home/ubuntu/AllSports-BE/allsports.2points.fr/private.key"), // Updated path to your private key
    cert: fs.readFileSync("/home/ubuntu/AllSports-BE/allsports.2points.fr/certificate.crt"), // Updated path to your certificate
};


// Create HTTPS server
const PORT = process.env.PORT || 443; // Use port 443 for HTTPS
https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
});

// Optionally, redirect HTTP to HTTPS
const http = require('http');

const httpPort = process.env.HTTP_PORT || 80; // HTTP port
http.createServer((req, res) => {
    res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
    res.end();
}).listen(httpPort, () => {
    console.log(`HTTP Server running on port ${httpPort} and redirecting to HTTPS`);
});

