require('dotenv').config();
var express = require('express');
var path = require('path');
var logger = require('morgan');

var invoicesRouter = require('./routes/invoices');

////////// mongo
////
const mongoose = require('mongoose');
const url = process.env.MONGO_URL;
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

connect.then((db) => {
    // To kill: $ npx kill-port 3000
    console.log("Connected correctly to server on baradmin port " + app.get("port") +".");
}, (err) => { console.log(err); });

////
////////// end mongo

var app = express();
app.use(logger('dev'));
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({ extended: false }));

app.use('/baradmin/invoices', invoicesRouter);

////////// files
////
const fileUpload = require('express-fileupload');
var fs = require('fs');
var cors = require('cors');
var whitelist = ['http://localhost:3500', 'http://localhost:3001', 'https://manuelgc.eu']

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

var corsOptionsDelegate = function (req, callback) {

    var corsOptions;
    console.log("ORI", req.header('Origin'))
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options

}

app.get('/baradmin/uploads', cors(corsOptionsDelegate), async (req, res, next) => {

    const directoryPath = './uploads';
    res.setHeader('Content-Type', 'application/json');
    fs.readdir(directoryPath, function (err, files) {
        if (err) 
            return res.status(500).send(err.message);
        const arr = files.map(v => ({
            name: v, 
            fullName: path.join(directoryPath, v), 
            type: v.indexOf('.') >= 0 ? v.split('.').pop() : ""
        }))    
        res.status(200).send(arr);
    });

});

app.get('/baradmin/uploads/:file', cors(corsOptionsDelegate), async (req, res, next) => {

    const filePath = './uploads/' + req.params.file;
    //res.type("application/octet-stream");
    //res.attachment("filename.ext");
    //res.sendFile(filePath);
    res.download(filePath); 

});

app.post('/baradmin/uploads', async (req, res) => {

    try {
        if (!req.files) {
console.log("L !REQFILES")
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
console.log("L REQFILES", req.files.file)
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            const file = req.files.file;

            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            file.mv('./uploads/' + file.name);
            //send response
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send({
                message: 'File is uploaded',
                data: {
                    name: file.name,
                    mimetype: file.mimetype,
                    size: file.size
                }
            });
        }
    } catch (err) {
console.log("L CATCH", err)
        res.status(500).send(err);
    }

});

app.delete('/baradmin/uploads/:file', (req, res) => {

    try {
        const filePath = './uploads/' + req.params.file;
        res.setHeader('Content-Type', 'application/json');
        fs.stat(filePath, function (err, stats) {
            if (err)
                throw new Error(err);
            fs.unlink(filePath, function (err) {
                if (err)
                    throw new Error(err);
                res.status(200).send({
                    status: true,
                    message: 'File deleted'
                });
            });
        });
    } catch (err) {
        res.status(500).send(err);
    }

})
////
////////// end files

module.exports = app;
