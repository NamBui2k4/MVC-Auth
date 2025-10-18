var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');

const session = require("express-session");
const loginRouter = require('./routes/login');
const  signinRouter = require('./routes/sigin');
const loadingRouter = require('./routes/loading');
var userRouter = require('./routes/user');

dotenv.config();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
app.use('/popper', express.static(path.join(__dirname, 'node_modules/@popperjs/core/dist/umd')))
app.use('/fa', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free')))
app.use(bodyParser.urlencoded({extended:true}))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie:{
    httpOnly: true,
    maxAge: 1000 * 60 * 60
  }
}));


app.use('/',loadingRouter)
app.use('/login', loginRouter);
app.use('/signin', signinRouter)

app.use('/user', userRouter);


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3001, () =>{
  console.log("server is running at http://localhost:3001")
})

module.exports = app;
