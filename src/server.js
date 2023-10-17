const express = require('express');
const path = require("path");
const app = express();

/// Settings   

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port); 

// Middleware

app.use(express.urlencoded({extended: false}));

// Routes
 
app.use(require('../routes/index'));

// Static assets

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
