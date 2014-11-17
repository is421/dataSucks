
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy
  , Purest = require('purest')
  , twitter = new Purest({
  	  provider:'twitter',
  	  key:'EUGbXnHc7TSlFZxkHp69i0l7y',
  	  secret:'fSmqoroZtrybNHYSehI0U3iEWoPzHNLSz6Nxb4EyLoHAxxiGIZ',	  
  	});

var app = module.exports = express.createServer();

// Configuration
// Apparently, order is very important when working with passport.js.
// Middleware hell!
app.configure(function() {
  app.set('views',__dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  //Hide this too. Does it even matter right now?
  app.use(express.session({ secret: 'SUPERDUPERSECRET' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


//Setup the Twitter strategy
//When this gets a little more serious, refrain from showing
//sensitive information like the consumer key and secret.
passport.use(new TwitterStrategy({
    consumerKey: "EUGbXnHc7TSlFZxkHp69i0l7y",
    consumerSecret: "fSmqoroZtrybNHYSehI0U3iEWoPzHNLSz6Nxb4EyLoHAxxiGIZ",
    callbackURL: "http://puppet.srihari.guru:3000/auth/twitter/callback",
  },
  function(token, tokenSecret, profile, done) {
  	//Steal all information here! Use profile object!
  	twitter.get('users/show',{
  		oauth:{
  			token: token,
  			secret: tokenSecret,
  		},
  		qs:{
  			user_id: profile.id,
  		},
  	},
  	function(err,res,body){
  		console.log(body);
  		console.log("Hello " + body.name);
  	});
  	return done(null, false);
  
}));

//Passport needs these
passport.serializeUser(function(user,done){
	done(null, user);
});

passport.deserializeUser(function(obj,done){
	done(null, obj);
});


// Routes
app.get('/', routes.index);

//Use this route to authenticate Twitter users
app.get('/auth/twitter', passport.authenticate('twitter'));

//Use this route as the callback for the Twitter authentication.
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/auth/twitter/youdidit',
  failureRedirect: '/auth/twitter/youfailed',
}));

//Test success
app.get('/auth/twitter/youdidit', function(req,res){
  res.send('You did it!');
});

//Test fail
app.get('/auth/twitter/youfailed', function(req,res){
  res.send('You failed!');
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
