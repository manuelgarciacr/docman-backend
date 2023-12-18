const mongoose = require('mongoose');
const url = process.env.MONGO_URL;

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

const connect = mongoose.connect(url, {  useUnifiedTopology: true }); // Another way to configure options 

connect.then(db => 
    // To kill: $ npx kill-port 3000 ??????
    console.log("Connected correctly to mongo server on %s and port %s.",  db.connection.host, db.connection.port)
)
.catch(err => console.error("ERR", err));
