"use strict";
exports.__esModule = true;
var express = require("express");
var gm = require("gm");
var multer = require("multer");
var ejs = require("ejs");
var fs = require("fs");
var filetypes = [
    'jpg',
    'png',
    'svg'
];
var app = express();
var storage = multer.diskStorage({
    destination: './img',
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
app.use('/assets/', express.static('assets/'));
app.get('/home', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.post('/api/files', upload.array('files'), function (req, res) {
    for (var i = 0; i < req.files.length; i++) {
        if (filetypes.includes(req.files[i].originalname.split('.').pop())) {
            resizeImage(req.files[i].originalname);
            res.sendStatus(200);
        }
        else {
            return res.status(500);
        }
    }
});
app.post('/api/file', upload.single('file'), function (req, res) {
    if (filetypes.includes('./img/' + req.file.filename.split('.').pop())) {
        resizeImage(req.file.originalname);
        res.sendStatus(200);
    }
    else {
        return res.status(500);
    }
});
app.get('*', function (req, res) {
    res.redirect('/home');
});
app.get('/gallery/images', function (req, res) {
    res.sendFile('./gallery_images.ejs');
});
function resizeImage(file) {
    gm('./img/' + file)
        .write('./img/orig_' + file, function (err) {
        if (!err)
            console.log('done');
    });
    gm('./img/' + file)
        .resize(720)
        .write('./changed/small/small_' + file, function (err) {
        if (err)
            console.log(err);
        if (!err)
            console.log('done');
    });
    gm('./img/' + file)
        .resize(1280)
        .write('./changed/medium/medium_' + file, function (err) {
        if (!err)
            console.log('done');
    });
    gm('./img/' + file)
        .resize(1920)
        .write('./changed/large/large_' + file, function (err) {
        if (!err)
            console.log('done');
    });
}
function readDirectory(path) {
    fs.readdirSync(path);
}
ejs.renderFile('./gallery_images.ejs', {
    data: readDirectory('./files/')
});
