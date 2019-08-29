const express = require('express');
const bodyParser = require('body-parser');

const app = express();
  
const port = 8080;
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
});

app.get('/', (req, res, next) => {
    res.send('<h1>Hello there</h1>');
})

app.post('/auth', (req, res, next) => {
    console.log(req.body);
});

app.listen(port);