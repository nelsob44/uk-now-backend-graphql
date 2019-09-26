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
const essentialRoutes = require('./routes/uk-life-essential');
const localRoutes = require('./routes/your-local');
const emailRoutes = require('./routes/email');


const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + '-' + file.originalname + '.png');
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

app.use(bodyParser.json());

app.use(
    multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
);


app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
  .json({ imageUrl: req.file.path });
});

app.use('/about', aboutRoutes);
app.use('/auth', authRoutes);

app.use('/email', emailRoutes);
app.use('/question', questionRoutes);
app.use('/blog', blogRoutes);
app.use('/event', eventRoutes);
app.use('/story', storiesRoutes);
app.use('/mentor', mentorRoutes);
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
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@nelsondan1-jjxt3.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
)
.then(result => {
    app.listen(process.env.PORT || port);   
})
.catch(err => console.log(err));
