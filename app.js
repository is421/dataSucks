
/**
 * Module dependencies.
 */

var express = require('express'), 
    routes = require('./routes'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    request = require('request'),
    http = require('http'),
    mongoose = require('mongoose'),
    Purest = require('purest')
    facebook = new Purest({provider : 'facebook'}),
    google = new Purest({provider : 'google'}),
    twitter = new Purest({
      provider:'twitter',
      key:'EUGbXnHc7TSlFZxkHp69i0l7y',
      secret:'fSmqoroZtrybNHYSehI0U3iEWoPzHNLSz6Nxb4EyLoHAxxiGIZ',    
    });





var app = module.exports = express.createServer();

// Configuration

mongoose.connect('mongodb://localhost/project');

require('./models/facebookUser');
require('./models/googleUser');
var FacebookUser = mongoose.model('FacebookUser');
var GoogleUser = mongoose.model('GoogleUser');

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

//Setup the Twitter strategy
//When this gets a little more serious, refrain from showing
//sensitive information like the consumer key and secret.
passport.use(new TwitterStrategy({
    consumerKey: "EUGbXnHc7TSlFZxkHp69i0l7y",
    consumerSecret: "fSmqoroZtrybNHYSehI0U3iEWoPzHNLSz6Nxb4EyLoHAxxiGIZ",
    callbackURL: "http://puppet.srihari.guru:3000/auth/twitter/callback",
  },
  function(token, tokenSecret, profile, done) {
    //Steal all information here! Use PuREST and profile!
    
    //Get my information.
    //Not necessary, just for fun.
    twitter.query()
      .get('users/show')
      .qs({user_id: profile.id})
      .auth(token,tokenSecret)
      .request(function(err, res, body){
         console.log("Hello " + body.name);
      });
    
    console.log("Your friends are...");
    
    
    //Get my friends!
    twitter.query()
      .get('friends/ids')
      .qs({user_id: profile.id})
      .auth(token,tokenSecret)
      .request(function(err, res, body){
        body.ids.forEach(function(element,index,array){
          whoIsThisPerson(token, tokenSecret, element);
        });
      });
      
    return done(null, false);

}));

function whoIsThisPerson(t,ts,fid){
  twitter.query()
    .get("users/show")
    .qs({user_id: fid})
    .auth(t,ts)
    .request(function(err, res, body){
      console.log(" -" + body.name);
    });
}


//Facebook Auth
//all paramerters need to change for hari's server
passport.use(new FacebookStrategy({
    clientID: "1571117689785844",
    clientSecret: "806e32f6e90d3e9c5ea95e8ae50356e1",
    callbackURL: "http://stevenbirkner.com:5000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {


    var facebookUser = new FacebookUser();

    facebookUser.name = profile.name['givenName'] + ' ' + profile.name['familyName'];
    facebookUser.profileLink = profile.profileUrl;
    facebookUser.gender = profile.gender;
    facebookUser.fbID = profile.id;
    console.log(facebookUser);
    FacebookUser.findOne({'name' : facebookUser.name}, function(err,user){
      if (user != null) {
        console.log('alread in DB');
      } else {
        facebookUser.save(function (err) {
          if(err) {
            console.log(err)
          } else {
            console.log(facebookUser);
          }

        });
      }
    });

    facebook.get('/' + profile.id+'/friends', {
      qs:{
        access_token : accessToken,
      }
    }, function (err, res, body) {
      console.log(body);
    });

    
    

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
  

      var googleUser = new GoogleUser();
      googleUser.name = profile.displayName;
      googleUser.email = profile._json['email'];
      googleUser.profileLink = profile._json['link'];
      googleUser.picture = profile._json['picture'];
      googleUser.gender = profile._json['gender'];
      googleUser.gID = profile._json['id'];

      GoogleUser.findOne({'name' : googleUser.name}, function(err,user){
        if (user != null) {
          console.log('already in db');
        } else {
          googleUser.save(function (err) {
            if(err) {
              console.log(err)
            } else {
              console.log(googleUser);
            }

          });
        }
      });

      google.get('people/connected',{
        api: 'plus',
        qs: {
          accessToken: token,
        }
      }, 
        function (err,res,body) {
          console.log(err);
        });


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

//Google routes
app.get('/auth/google', passport.authenticate('google',{ 
  scope: ['https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/plus.login',
          'https://www.googleapis.com/auth/plus.me'] }
));

app.get('/auth/google/callback', passport.authenticate('google', { 
  successRedirect: '/',
  failureRedirect: '/auth/google/success' 
}));

app.get('/auth/google/success', function(req,res){
  res.render('google');
});

app.get('/gUsers', function(req,res){
  mongoose.model('GoogleUser').find(function(err,googleUsers){
    res.json(googleUsers);
  });
});
//Facebook routes
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['read_stream', 'publish_actions','email','user_friends'] }));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/auth/facebook/success',
}));

app.get('/auth/facebook/success', function(req,res){
  res.render('facebook');
});

app.get('/fbUsers', function(req,res){
  mongoose.model('FacebookUser').find(function(err,facebookUsers){
    res.json(facebookUsers);
  });
});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(5000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
