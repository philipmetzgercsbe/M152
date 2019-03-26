import * as express from "express";
import * as gm from "gm";
import * as multer from "multer";

const app = express();

app.use('/static/small', express.static('changed/small'));
app.use('/static/medium', express.static('changed/medium'));
app.use('/static/large', express.static('changed/large'));
app.use('/static/orig', express.static('img/'));

app.get('/home', function (req: express.Request, res: express.Response) {
    res.sendFile( __dirname + "/index.html");
});


app.post('/upload',multer.upload.single('img'), function (req, res) {
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

app.get('/', function (req, res) {
    res.sendFile(__dirname +"index.html");
});

app.listen(80, function () {
    console.log("Server listens on port " + 80);
});
