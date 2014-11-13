
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

app.use(express.cookieParser());
app.use(express.session({secret: 'SUPERSECRET123'}));

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;


//Setup the Twitter strategy
passport.use(new TwitterStrategy({
    consumerKey: "EUGbXnHc7TSlFZxkHp69i0l7y",
    consumerSecret: "fSmqoroZtrybNHYSehI0U3iEWoPzHNLSz6Nxb4EyLoHAxxiGIZ",
    callbackURL: "http://puppet.srihari.guru:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
}));


// Routes

app.get('/', routes.index);


//Use this route to authenticate Twitter users
app.get('/auth/twitter', passport.authenticate('twitter'));

//Use this route as the callback for the Twitter authentication.
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/auth/twitter/youdidit',
  failureRedirect: '/'}));

//Test!
app.get('/auth/twitter/youdidit', function(req,res){
  res.send('You did it!');
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
