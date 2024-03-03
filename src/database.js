//const mongoose = require('mongoose');
import debug from 'debug';
import mongoose from "mongoose";

//mongoose.set("useNewUrlParser", true);
//mongoose.set("useFindAndModify", false);
//mongoose.set("useCreateIndex", true);

const log = debug('database:log');
const error = debug('database:error');
const url = process.env.MONGO_URL;
const connect = mongoose.connect(url, {  }); // Another way to configure options 

// connect.then(db => 
//     // To kill: $ npx kill-port 3000 ??????
//     log("Connected correctly to mongo server on %s and port %s.",  db.connection.host, db.connection.port)
// )
// .catch(err => error("ERR: %s", err));

await connect
    .then(db => {
        log(
            "Connected correctly to mongo server on %s and port %s.",
            db.connection.host,
            db.connection.port
        ); 
 //       return db
    })
    .catch(err => error("ERR: %s", err)) ;

//export { db };
