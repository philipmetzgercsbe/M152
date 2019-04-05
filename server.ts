import * as express from "express";
import * as gm from "gm";
import * as multer from "multer";
import * as mime from "mime";
import * as ejs from "ejs";
import * as fs from "fs";
import * as path from "path";
import * as fluentmpeg from "fluent-ffmpeg";
import * as fluent from "ffmpeg";
import * as ws from "ws";
import * as http from "http";
import * as https  from "https";

const filetypes = [
    'jpg',
    'png',
    'svg'
] 

const videotypes = [
    'mp4',
    'wav',
    'wmv',
    'mov',
    'flv'

]


const app = express();
const httpserver = http.createServer(app);
const wss = new ws.Server({httpserver});
const storage = multer.diskStorage({
    destination: './files/img',
    filename: function (req,file,cb){
        cb(null, file.originalname);
    }
});
const storage1 = multer.diskStorage({
    destination: './files/videos/unchanged/',
    filename: function (req,file,cb){
        cb(null, file.originalname);
    }
});
const storage2 = multer.diskStorage({
    destination: './files/audio/',
    filename: function (req,file,cb){
        cb(null, file.originalname);
    }
});
const imageupload = multer({storage: storage})
const videoupload = multer({storage: storage1})
const audioupload = multer({storage: storage2})
app.listen(process.env.PORT || 80,function (){
    console.log("Server listens on port"+80);
});

app.set('view engine', 'ejs');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
    next();
});

app.use('/files/', express.static('./files/changed/'));
app.use('/files/', express.static('./files/img/'));
app.use('/assets/', express.static('assets/'));
app.use('/videos/', express.static('./files/videos/changed/'));
app.use('/audio/',express.static('./files/audio/'));

let mergedVideo = fluentmpeg();
let videoNames = [];


app.get('/home', function (req: express.Request, res: express.Response) {
    res.sendFile(__dirname + "/index.html");
});

app.post('/api/files', imageupload.array('files'), function (req, res) {
    for (let i = 0; i<req.files.length; i++) {
        if(filetypes.includes(req.files[i].originalname.split('.').pop())){
        resizeImage(req.files[i].originalname);       
        res.sendStatus(200);
        }else{
            return res.sendStatus(500)
        }
    }
   

});

app.post('/api/file', imageupload.single('file'), function (req, res) {
   if(filetypes.includes('./files/img' +req.file.filename.split('.').pop())){
    resizeImage(req.file.originalname);
    res.sendStatus(200);
    }else{
        return res.sendStatus(500);
    }

});

app.post('/api/videos',videoupload.array('videos'), function (req, res) {
    mergedVideo.setFfprobePath('C:/Users/vmadmin/Desktop/ffmpeg/ffmpeg/bin/ffprobe.exe') //Shouldn't be local
    for (let i = 0; i<req.files.length; i++) {
        if(videotypes.includes(req.files[i].originalname.split('.').pop())){
        videoNames.push('./files/videos/unchanged/'+req.files[i].originalname);
        }
    }
    videoNames.forEach(function(videoName){
        mergedVideo = mergedVideo.addInput(videoName);
    });
    console.log(videoNames);
    let actualName = req.body.videoname + '.mp4'
    mergedVideo.format("mp4");
    mergedVideo.mergeToFile('./files/videos/changed/' + actualName)
    .on('error', function(err) {
        console.log('Error ' + err.message);
    })
    .on('end', function() {
        console.log('Finished!');
        res.status(200);
        res.redirect('/play_video?videoName=' + actualName)
    });
    setTimeout(mergedVideo.mergeToFile, 50000, 'fun');
});

app.post('/api/audio', audioupload.array('audio'), function (req, res) {
     let audiofile = req.files[0]; //Writing to wrong Directory /vtt instead /audio and /vtt
     let vttFile = req.files[1];

     fs.rename('./files/audio/' + audiofile.originalname, './files/audio/mp3/'  + audiofile.originalname , function(error){
        if(error){
            console.log(error);
        }
    });
    fs.rename('./files/audio/' + vttFile.originalname, './files/audio/vtt/'  + audiofile.originalname.split('.').slice(0,-1) + '.vtt', function(error){
         if(error){
             console.log(error);
         }
     })
     res.redirect('/play_audio?audioName=' + audiofile.originalname);
 });

app.get('/play_video/',function(req, res){
    if(fs.readdirSync('./files/videos/changed/').includes(req.query.videoName)){
        res.render('play_video',{video: req.query.videoName})
    }
});

app.get('/play_audio',function(req, res){
    if(fs.readdirSync('./files/audio/mp3/').includes(req.query.audioName)){
        let actualSub = req.query.audioName.split('.').slice(0,-1) + '.vtt';
        res.render('play_audio',{audio: req.query.audioName, subtitle: actualSub})
    }
});
app.get('/audio_manager',function(req,res){
    res.render('audio_manager');

});

app.get('/video_manager',function(req,res){
    res.render('video_manager');

});

app.get('/gallery/image' ,function(req,res){
    res.render('gallery_images',{images: fs.readdirSync('./files/img/'),data: fs.readdirSync('./files/changed/')});
});

app.get('/webchat', function(req, res){
    res.render('webchat');
});

app.get('*', function (req, res) {
    res.redirect('/home');
});

function resizeImage(file: string){
    gm('./files/img/' + file)
        .write('./files/img/orig_' + file, function (err) {
            if (!err) console.log('done');
        });
    gm('./files/img/' +file)
        .resize(720)
        .write('./files/changed/small_' + file , function (err) {
            if(err) console.log(err);
            if (!err) console.log('done');
        });

    gm('./files/img/' +file)
        .resize(1280)
        .write('./files/changed/medium_' + file , function (err) {
            if (!err) console.log('done');
        });

    gm('./files/img/' +file)
        .resize(1920)
        .write('./files/changed/large_' + file , function (err) {
            if (!err) console.log('done');
        });
    
}




