"use strict";
exports.__esModule = true;
var express = require("express");
var gm = require("gm");
var multer = require("multer");
var filetypes = [
    '.jpg',
    '.png',
    '.svg'
];
var app = express();
var storage = multer.diskStorage({
    destination: __dirname,
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage });
app.listen(process.env.PORT || 80, function () {
    console.log("Server listens on port" + 80);
});
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
    next();
});
app.use('/files/', express.static('changed/small'));
app.use('/files/', express.static('changed/medium'));
app.use('/files/', express.static('changed/large'));
app.use('/files/', express.static('img/'));
app.get('/home', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.post('/upload', upload.single('img'), function (req, res) {
    if (filetypes.includes(req.file.filename.split('.').pop())) {
        gm('img')
            .write('./img/' + req.file.originalname, function (err) {
            if (err)
                console.log(err);
            if (!err)
                console.log('done');
        });
        gm('img')
            .resize(720)
            .write('./changed/small/small_' + req.file.originalname, function (err) {
            if (!err)
                console.log('done');
        });
        gm('img')
            .resize(1280)
            .write('./changed/medium/medium_' + req.file.originalname, function (err) {
            if (!err)
                console.log('done');
        });
        gm('img')
            .resize(1920)
            .write('./changed/large/large_' + req.file.originalname, function (err) {
            if (!err)
                console.log('done');
        });
    }
    else {
        return res.redirect('/home');
    }
});
app.post('/api/file', upload.single('file'), function (req, res) {
    if (filetypes.includes(req.file.filename.split('.').pop())) {
        gm(req.file.originalname)
            .write('./img/' + req.file.originalname, function (err) {
            if (!err)
                console.log('done');
        });
        gm(req.file.originalname)
            .resize(720)
            .write('./changed/small/small_' + req.file.originalname, function (err) {
            if (err)
                console.log(err);
            if (!err)
                console.log('done');
        });
        gm(req.file.originalname)
            .resize(1280)
            .write('./changed/medium/medium_' + req.file.originalname, function (err) {
            if (!err)
                console.log('done');
        });
        gm(req.file.originalname)
            .resize(1920)
            .write('./changed/large/large_' + req.file.originalname, function (err) {
            if (!err)
                console.log('done');
        });
    }
    else {
        return res.status(500);
    }
});
app.get('', function (req, res) {
    res.redirect('/home');
});
