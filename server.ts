import * as express from "express";
import * as gm from "gm";
import * as multer from "multer";

const app = express();
const storage = multer.diskStorage({
    destination: __dirname,
    filename: function (req,file,cb){
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage})
app.listen(process.env.PORT || 80,function (){
    console.log("Server listens on port"+80);
});

app.use('/static/small', express.static('changed/small'));
app.use('/static/medium', express.static('changed/medium'));
app.use('/static/large', express.static('changed/large'));
app.use('/static/orig', express.static('img/'));

app.get('/home', function (req: express.Request, res: express.Response) {
    res.sendFile(__dirname + "/index.html");
});

app.post('/upload', upload.single('img'), function (req, res) {
    gm('img')
        .write('./img/' + 'img', function (err) {
            if (!err) console.log('done');
        });
    gm('img')
        .resize(720)
        .write('./changed/small/small_img', function (err) {
            if (!err) console.log('done');
        });

    gm('img')
        .resize(1280)
        .write('./changed/medium/medium_img', function (err) {
            if (!err) console.log('done');
        });

    gm('img')
        .resize(1920)
        .write('./changed/large/large_img', function (err) {
            if (!err) console.log('done');
        });

});

app.post('/', upload.single(''), function (req, res) {
    gm(req.file.filename)
        .write('./img/' + req.file.filename, function (err) {
            if (!err) console.log('done');
        });
    gm(req.file.filename)
        .resize(720)
        .write('./changed/small/small_' + req.file.filename , function (err) {
            if (!err) console.log('done');
        });

    gm(req.file.filename)
        .resize(1280)
        .write('./changed/medium/medium_' + req.file.filename, function (err) {
            if (!err) console.log('done');
        });

    gm(req.file.filename)
        .resize(1920)
        .write('./changed/large/large_' + req.file.filename, function (err) {
            if (!err) console.log('done');
        });

});
app.get('/', function (req, res) {
    res.sendFile(__dirname + "index.html");
});

