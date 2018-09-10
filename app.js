const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const errorHandler = require('errorhandler');
const mongoose = require('mongoose');

const app = express();

mongoose.promise = global.Promise;

const isProduction = process.env.NODE_ENV === 'production';

const db = require('./config/keys').mongoURI;

mongoose.connect(db)
.then(() => console.log('Połączony...'))
.catch(err => console.log(err) );

require('./models/Articles.js');
routes = require('./routes/index.js');


app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'MałyBlog', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if(!isProduction) {
  app.use(errorHandler());
}


mongoose.set('debug', true);


app.use(require('./routes'));


app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
});

if (!isProduction) {
  app.use((err, req, res) => {
    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

app.use((err, req, res) => {
  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log('Server działa na http://localhost:8000'));