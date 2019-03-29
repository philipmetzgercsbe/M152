import * as express from "express";
import * as gm from "gm";
import * as multer from "multer";
import * as mime from "mime";
import * as ejs from "ejs";
import * as fs from "fs";
import * as path from "path";

const filetypes = [
    'jpg',
    'png',
    'svg'
]

const app = express();
const storage = multer.diskStorage({
    destination: './files/img',
    filename: function (req,file,cb){
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage})
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


app.get('/home', function (req: express.Request, res: express.Response) {
    res.sendFile(__dirname + "/index.html");
});

app.post('/api/files', upload.array('files'), function (req, res) {
    for (let i = 0; i<req.files.length; i++) {
        if(filetypes.includes(req.files[i].originalname.split('.').pop())){
        resizeImage(req.files[i].originalname);       
        res.sendStatus(200);
        }else{
            return res.status(500)
        }
    }
   

});

app.post('/api/file', upload.single('file'), function (req, res) {
   if(filetypes.includes('./files/img' +req.file.filename.split('.').pop())){
    resizeImage(req.file.originalname);
    res.sendStatus(200);
    }else{
        return res.status(500);
    }

});



app.get('/gallery/image' ,function(req,res){
    res.render('gallery_images',{images: fs.readdirSync('./files/img/'),data: fs.readdirSync('./files/changed/')});
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

