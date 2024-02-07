#!/usr/bin/env node

/**
 * Setting environment
 */

//debug = require('debug')('sprint9') // Global function
//require('dotenv').config(); // Environment vars
//console.log(process.env)
//const app = require('../src/server'); // Importing Express server
//const http = require('http'); // Or https
import debug from 'debug';
import 'dotenv/config';
import app from '../src/server.js'; // Importing Express server
import http from 'http'; // Or https

const log = debug('www:log');
const error = debug('www:error');

/**
 * Connect to database
 */

//require('../src/database');
import '../src/database.js';

/**  
 * Create HTTP server.
 */

var server = http.createServer(app); // Or https  

/**
 * Listen on provided port, on all network interfaces.
 */

// var listener = server.listen(app.get('port'), function(){
//     console.log('Listening on port ' + listener.address().port);
// });
// server.on('error', onError);
// server.on('listening', onListening);
app.get('port').then(port => {
    var listener = server.listen(port, function(){
        //log('Listening on port %s', listener.address().port);
    });
    server.on('error', onError);
    server.on('listening', onListening);
}).catch(err => error("ERROR: %s", err))
  
/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const port = app.get('port');
    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            error('ERROR: %s requires elevated privileges', bind);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            // lsof -i tcp:3200
            // kill -9 PID
            error('ERROR: %s is already in use', bind);
            process.exit(1);
            break;
        default:
            throw error;
     }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address();
    const  bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;

    log('Listening on %s', bind);
}
