require('dotenv').config();
//var express = require('express');
//var path = require('path');
//var logger = require('morgan');
const express = require('express');
const path = require( 'path');
const logger = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

////////// passport
////
//var passport = require('passport');
//var authenticate = require('./authenticate');
////
////////// end passport

//var usersRouter = require('./routes/users');
const usersRouter = require('../routes/users');

////////// mongo
////
//const mongoose = require('mongoose');

////
////////// end mongo


// Settings
/**
 * Get port from environment and store in Express.
 */
const app = express();
console.log("PORTPORT")
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
console.log("SESESE", app.get('port'))
app.use(cookieParser(process.env.SECRET_KEY));
app.use(logger('dev'));
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

app.use('/sprint9/users', usersRouter);
app.use(function(err, _, res, _) {
    res.status(err.statusCode || 500).json(err).send();
});

// Middleware

app.use(express.urlencoded({extended: false}));

// Static assets

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;

// TEST

const exiftool = require('./exiftool.js');

exiftool.process('./docs/CV manuel garcia 202310.pdf', exiftool.writeOne)
//exiftool.process('./docs/favicon.png', exiftool.writeOne)

/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = (val) => {
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
