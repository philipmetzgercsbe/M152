"use strict";
exports.__esModule = true;
var express = require("express");
var gm = require("gm");
var multer = require("multer");
var fs = require("fs");
var fluentmpeg = require("fluent-ffmpeg");
var ws = require("ws");
var http = require("http");
var filetypes = [
    'jpg',
    'png',
    'svg'
];
var videotypes = [
    'mp4',
    'wav',
    'wmv',
    'mov',
    'flv'
];
var app = express();
var server = http.createServer(app);
var wssport = process.env.PORT || 80;
var wss = new ws.Server({ server: server });
var storage = multer.diskStorage({
    destination: './files/img',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var storage1 = multer.diskStorage({
    destination: './files/videos/unchanged/',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var storage2 = multer.diskStorage({
    destination: './files/audio/',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var imageupload = multer({ storage: storage });
var videoupload = multer({ storage: storage1 });
var audioupload = multer({ storage: storage2 });
server.listen(wssport, function () {
    console.log("Server listens on port" + wssport);
});
app.set('view engine', 'ejs');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
    next();
});
app.use('/files/', express.static('./files/changed/'));
app.use('/files/', express.static('./files/img/'));
app.use('/assets/', express.static('./assets/'));
app.use('/videos/', express.static('./files/videos/changed/'));
app.use('/audio/', express.static('./files/audio/'));
var mergedVideo = fluentmpeg();
var videoNames = [];
app.get('/home', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
wss.on('connection', function (ws) {
    //Finish this => Client validation
    wss.clients
        .forEach(function (client) {
        client.send(JSON.stringify({
            user: "WebyWebo",
            text: 'New user joined the WebyWebo Chat!',
            date: new Date().toLocaleTimeString()
        }));
    });
    //connection is up, let's add a simple simple event
    ws.on('message', function (data) {
        //log the received message and send it back to the client
        wss.clients
            .forEach(function (client) {
            if (client !== ws) {
                client.send("" + data);
            }
            else {
                ws.send("" + data);
            }
        });
    });
    ws.send(JSON.stringify({
        user: "WebyWebo",
        text: 'Nice to see you again.',
        date: new Date().toLocaleTimeString()
    }));
    setInterval(function () {
        wss.clients.forEach(function (client) {
            client.send(new Date().toTimeString());
        });
    }, 15000);
});
setInterval(function () {
    wss.clients.forEach(function (ws) {
        if (!ws.isAlive) {
            ws.send(JSON.stringify({
                user: ws.client,
                message: "" + ws.client.username + "has left the channel",
                date: new Date().toLocaleTimeString()
            }));
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(null, false, true);
    });
}, 15000);
app.post('/api/files', imageupload.array('files'), function (req, res) {
    for (var i = 0; i < req.files.length; i++) {
        if (filetypes.includes(req.files[i].originalname.split('.').pop())) {
            resizeImage(req.files[i].originalname);
            res.sendStatus(200);
        }
        else {
            return res.sendStatus(500);
        }
    }
});
app.post('/api/file', imageupload.single('file'), function (req, res) {
    if (filetypes.includes('./files/img' + req.file.filename.split('.').pop())) {
        resizeImage(req.file.originalname);
        res.sendStatus(200);
    }
    else {
        return res.sendStatus(500);
    }
});
app.post('/api/videos', videoupload.array('videos'), function (req, res) {
    mergedVideo.setFfprobePath('C:/Users/vmadmin/Desktop/ffmpeg/ffmpeg/bin/ffprobe.exe'); //Shouldn't be local
    for (var i = 0; i < req.files.length; i++) {
        if (videotypes.includes(req.files[i].originalname.split('.').pop())) {
            videoNames.push('./files/videos/unchanged/' + req.files[i].originalname);
        }
    }
    videoNames.forEach(function (videoName) {
        mergedVideo = mergedVideo.addInput(videoName);
    });
    console.log(videoNames);
    var actualName = req.body.videoname + '.mp4';
    mergedVideo.format("mp4");
    mergedVideo.mergeToFile('./files/videos/changed/' + actualName)
        .on('error', function (err) {
        console.log('Error ' + err.message);
    })
        .on('end', function () {
        console.log('Finished!');
        res.status(200);
        res.redirect('/play_video?videoName=' + actualName);
    });
    setTimeout(mergedVideo.mergeToFile, 50000, 'fun');
});
app.post('/api/audio', audioupload.array('audio'), function (req, res) {
    var audiofile = req.files[0]; //Writing to wrong Directory /vtt instead /audio and /vtt
    var vttFile = req.files[1];
    fs.rename('./files/audio/' + audiofile.originalname, './files/audio/mp3/' + audiofile.originalname, function (error) {
        if (error) {
            console.log(error);
        }
    });
    fs.rename('./files/audio/' + vttFile.originalname, './files/audio/vtt/' + audiofile.originalname.split('.').slice(0, -1) + '.vtt', function (error) {
        if (error) {
            console.log(error);
        }
    });
    res.redirect('/play_audio?audioName=' + audiofile.originalname);
});
app.get('/play_video/', function (req, res) {
    if (fs.readdirSync('./files/videos/changed/').includes(req.query.videoName)) {
        res.render('play_video', { video: req.query.videoName });
    }
});
app.get('/play_audio', function (req, res) {
    if (fs.readdirSync('./files/audio/mp3/').includes(req.query.audioName)) {
        var actualSub = req.query.audioName.split('.').slice(0, -1) + '.vtt';
        res.render('play_audio', { audio: req.query.audioName, subtitle: actualSub });
    }
});
app.get('/audio_manager', function (req, res) {
    res.render('audio_manager');
});
app.get('/video_manager', function (req, res) {
    res.render('video_manager');
});
app.get('/gallery/image', function (req, res) {
    res.render('gallery_images', { images: fs.readdirSync('./files/img/'), data: fs.readdirSync('./files/changed/') });
});
app.get('/webchat', function (req, res) {
    res.render('webchat');
});
app.get('*', function (req, res) {
    res.redirect('/home');
});
function resizeImage(file) {
    gm('./files/img/' + file)
        .write('./files/img/orig_' + file, function (err) {
        if (!err)
            console.log('done');
    });
    gm('./files/img/' + file)
        .resize(720)
        .write('./files/changed/small_' + file, function (err) {
        if (err)
            console.log(err);
        if (!err)
            console.log('done');
    });
    gm('./files/img/' + file)
        .resize(1280)
        .write('./files/changed/medium_' + file, function (err) {
        if (!err)
            console.log('done');
    });
    gm('./files/img/' + file)
        .resize(1920)
        .write('./files/changed/large_' + file, function (err) {
        if (!err)
            console.log('done');
    });
}
