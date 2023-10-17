const express = require('express');
const {engine: exphbs} = require('express-handlebars');
const path = require("path");
const app = express();
const tcpPortUsed = require('tcp-port-used');

/// Settings   

const port = normalizePort(process.env.PORT || '3000');

app.set('port', port); 
app.set('views', path.join(__dirname, 'views'));
debug(exphbs)
app.engine('hbs', exphbs({
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');

// Middleware

app.use(express.urlencoded({extended: false}));

// Routes
 
app.use(require('./routes/index'));

// Static assets

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;

/**
 * Normalize a port into a number, string, or false.
 */

async function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        return tcpPortUsed.check(port)
        .then(function (inUse) {
            //console.log("HOST1", server.address())
            if (inUse) {
                console.log('Port %s usage: %s', port, inUse);
                return 0
            }
            return port
        }, function (err) {
            //console.log("HOST2", server.address())
            console.error('Error on check:', err.message);
            return 0
        });
    }

    return false;
}


