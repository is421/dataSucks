
/**
 * Module dependencies.
 */

var express = require('express'), 
    routes = require('./routes'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session');





var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/bower_components'));
  app.use(cookieParser());
  app.use(expressSession({ secret: 'idkanymore' })); 

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

//Facebook Auth
//all paramerters need to change for hari's server
passport.use(new FacebookStrategy({
    clientID: "1571117689785844",
    clientSecret: "806e32f6e90d3e9c5ea95e8ae50356e1",
    callbackURL: "http://stevenbirkner.com:5000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    return done(null,false) 
  }
));

//Google Auth
passport.use(new GoogleStrategy({
    clientID: "824927381407-ot3cie5fsn29s6ql75d44k7to2ldrt3b.apps.googleusercontent.com",
    clientSecret: "K325i7e2GABUyjGw5lo7w5zD",
    callbackURL: "http://stevenbirkner.com:5000/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
      console.log(profile);
      return done(null, false);
   
  }
));

passport.serializeUser(function(user,done){
  console.log('luckycharms'); 
  done(null, user);
});

passport.deserializeUser(function(obj,done){
  console.log('emptybowl');
  done(null, obj);
});

// Routes
app.get('/', function(req, res){
  res.render('index', { title: 'Data Sucks' });
});

//Google routes
app.get('/auth/google', passport.authenticate('google',{ 
  scope: ['https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'] }
));

app.get('/auth/google/callback', passport.authenticate('google', { 
  successRedirect: '/auth/google/success',
  failureRedirect: '/' 
}));

app.get('auth/google/success', function(req,res){
  res.send('google boom');
});

//Facebook routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/auth/facebook/success',
  failureRedirect: '/',
}));

app.get('auth/facebook/success', function(req,res){
  res.send('boom');
});



app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(5000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
