"use strict";
exports.__esModule = true;
var express = require("express");
var gm = require("gm");
var multer = require("multer");
var mime = require("mime");
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
app.use('/files/', express.static('changed/small'));
app.use('/files/', express.static('changed/medium'));
app.use('/files/', express.static('changed/large'));
app.use('/files/', express.static('img/'));
app.get('/home', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.post('/upload', upload.single('img'), function (req, res) {
    gm('img')
        .write('./img/' + 'img', function (err) {
        if (!err)
            console.log('done');
    });
    gm('img')
        .resize(720)
        .write('./changed/small/small_img', function (err) {
        if (!err)
            console.log('done');
    });
    gm('img')
        .resize(1280)
        .write('./changed/medium/medium_img', function (err) {
        if (!err)
            console.log('done');
    });
    gm('img')
        .resize(1920)
        .write('./changed/large/large_img', function (err) {
        if (!err)
            console.log('done');
    });
});
app.post('/', upload.single(''), function (req, res) {
    if (mime.getType(req.file.originalname) != '.jpg' || mime.getType(req.file.originalname) != '.png') {
        return res.status(500);
    }
    gm(req.file.originalname)
        .write('./img/' + req.file.originalname, function (err) {
        if (!err)
            console.log('done');
    });
    gm(req.file.originalname)
        .resize(720)
        .write('./changed/small/small_' + req.file.originalname, function (err) {
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
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + "index.html");
});
