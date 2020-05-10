const port = 8080;
const fs = require('fs');

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const aboutRoutes = require('./routes/about');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/ask-a-question');
const blogRoutes = require('./routes/blog');
const eventRoutes = require('./routes/local-event');
const storiesRoutes = require('./routes/stories');
const mentorRoutes = require('./routes/mentor');
const messageRoutes = require('./routes/message');
const essentialRoutes = require('./routes/uk-life-essential');
const localRoutes = require('./routes/your-local');
const emailRoutes = require('./routes/email');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const cors = require('cors');

const app = express();

app.use(cors());

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'images');
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().getTime() + '-' + file.originalname + '.png');
//   }
// });

const s3Config = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET
  });

let uniqueName;

const multerS3Config = multerS3({
    s3: s3Config,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        uniqueName = new Date().getTime() + '-' + file.originalname + '.png';
        
        cb(null, uniqueName)
    }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};



const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        uniqueName = new Date().getTime() + '-' + file.originalname + '.png';
        
        cb(null, uniqueName)
    }
});

app.use(bodyParser.json());

app.use(
    multer({storage: multerS3Config, 
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // we are allowing only 5 MB files
    }}).single('image')
);



// const upload = multer({
//     storage: multerS3Config,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 1024 * 1024 * 5 // we are allowing only 5 MB files
//     }
// });

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept, content-type, application/json');
    if(req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
});

app.put('/post-image', (req, res, next) => {
  
  
  if(!req.file) {
    return res.status(200).json({ message: 'No file provided' });
  }
  
  return res
  .status(201)
  .json({ imageUrl: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${uniqueName}` });
});

app.use('/about', aboutRoutes);
app.use('/auth', authRoutes);

app.use('/email', emailRoutes);
app.use('/question', questionRoutes);
app.use('/blog', blogRoutes);
app.use('/event', eventRoutes);
app.use('/story', storiesRoutes);
app.use('/mentor', mentorRoutes);
app.use('/message', messageRoutes);
app.use('/essential', essentialRoutes);
app.use('/local', localRoutes);

const accessLoStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLoStream }));

app.use((error, req, res, next) => {
    
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error;
    res.status(status).json({message: message, data: data});
});


mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@nelsondan1-jjxt3.mongodb.net/uknow?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(result => {
    const server = app.listen(process.env.PORT || port); 
    const io = require('./socket').init(server);  
    io.on('connection', socket => {
      console.log('client is connected');
    });
})
.catch(err => console.log(err));
