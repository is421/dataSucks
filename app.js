
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
    Schema = mongoose.Schema;
    Purest = require('purest')
    facebook = new Purest({provider : 'facebook'}),
    google = new Purest({provider : 'google'}),
    twitter = new Purest({
      provider:'twitter',
      key:'EUGbXnHc7TSlFZxkHp69i0l7y',
      secret:'fSmqoroZtrybNHYSehI0U3iEWoPzHNLSz6Nxb4EyLoHAxxiGIZ',    
    });



//User Schema
var userSchema = new Schema({
	username: String,
	password: String,
	name: String,
});

userSchema.methods.validPassword = function(password){
	if(password == this.password)
	  return true;
	else
	  return false;
}

var identitySchema = new Schema({
	name: String,
	belongsTo: String,
	Twitter: String,
	Facebook: String,
	Gmail: String,
});

//Dummy Model
var User = mongoose.model('User',userSchema);
var Identity = mongoose.model('Identity',identitySchema);

var app = module.exports = express.createServer();

// Configuration

mongoose.connect('mongodb://localhost/jOrtega');

require('./models/facebookUser');
require('./models/googleUser');
require('./models/twitterUser');
var FacebookUser = mongoose.model('FacebookUser');
var GoogleUser = mongoose.model('GoogleUser');
var TwitterUser = mongoose.model('TwitterUser');


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.static(__dirname + '/public'));
  app.use(cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'SUPERDUPERSECRET' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/bower_components'));
  app.use(expressSession({ secret: 'idkanymore' })); 

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback(){
	
});

//Setup the Twitter strategy
//When this gets a little more serious, refrain from showing
//sensitive information like the consumer key and secret.
passport.use(new TwitterStrategy({
    consumerKey: "EUGbXnHc7TSlFZxkHp69i0l7y",
    consumerSecret: "fSmqoroZtrybNHYSehI0U3iEWoPzHNLSz6Nxb4EyLoHAxxiGIZ",
    callbackURL: "http://puppet.srihari.guru:5000/auth/twitter/callback",
  },
  function(token, tokenSecret, profile, done) {
    //Steal all information here! Use PuREST and profile!
    /*
    var twitterUser = new TwitterUser();
    
    twitterUser.name = profile._json['name'];
    twitterUser.screenName = profile._json['screen_name'];
    twitterUser.tID = profile._json['id'];

    console.log("Your friends are...");
    
    //Get my friends!
    twitter.query()
      .get('friends/ids')
      .qs({user_id: profile.id})
      .auth(token,tokenSecret)
      .request(function(err, res, body){
      	twitterUser.friendIDs = body.ids;
      	console.log(body);
        body.ids.forEach(function(element,index,array){
          whoIsThisPerson(token, tokenSecret, element);
        });
      });
      
      TwitterUser.findOne({'name' : twitterUser.name}, function(err,user){
      if (user != null) {
        console.log('already in DB');
      } else {
        twitterUser.save(function (err) {
          if(err) {
            console.log(err)
          } else {
            console.log(twitterUser);
          }

        });
      }
      
      done(null,user);
    */
   
    var user = {
    	"token": token,
    	"secret": tokenSecret,
    	"profile": profile,
	"token": token,
	"tokenSecret": tokenSecret,
    }; 
    
    return done(null,user); 
   
    }
    
    )
	
);

function checkTwitterUser(t,ts,fid,req){
  twitter.query()
    .get("users/show")
    .qs({user_id: fid})
    .auth(t,ts)
    .request(function(err, res, body){

	var found = false;

	Identity.findOne({belongsTo: req.session.myid, Twitter: body.screen_name},function(err,iden){
	  if(iden){
	    iden.Twitter = body.screen_name;
	    iden.save();
	    found = true;
	  }
	});

	if(!found){
	  Identity.create({
	    name: body.name,
	    belongsTo: req.session.myid,
	    Twitter: body.screen_name,
	}, function(err, newTwitter){
		if(err)
		  console.log("Error saving Twitter identity");
	   });
    }
	
  });
}

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

//Facebook Auth
//all paramerters need to change for hari's server
passport.use(new FacebookStrategy({
    clientID: "1560786467485542",
    clientSecret: "e24464dc2d21530cd40df35c60695e69",
    callbackURL: "http://puppet.srihari.guru:5000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {


    var facebookUser = new FacebookUser();

    facebookUser.name = profile.name['givenName'] + ' ' + profile.name['familyName'];
    facebookUser.profileLink = profile.profileUrl;
    facebookUser.gender = profile.gender;
    facebookUser.fbID = profile.id;

    
    facebook.get('/' + profile.id+'/friends', {
      qs:{
        access_token : accessToken,
      }
    }, function (err, res, body) {
      body.data.forEach(function(element,index,array){
      	var temp = {name : element['name'], id : element['id']};
      	console.log(temp);
      	facebookUser.friends.push(temp);
      	
      });
      FacebookUser.findOne({'name' : facebookUser.name}, function(err,user){
      if (user != null) {
     	console.log(facebookUser);
        console.log('already in DB');
        
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
    });
    
   
  

    return done(null,false) 
  }
));

//Google Auth
passport.use(new GoogleStrategy({
    clientID: "824927381407-6fk6vlvg3kmtehk1uqrifkdaon1hggja.apps.googleusercontent.com",
    clientSecret: "tP9Q2U7M0EU7KJI4vatrd27w",
    callbackURL: "http://puppet.srihari.guru:5000/auth/google/callback"
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
  console.log('raisinbran');
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function(obj,done){
  console.log('emptybowl');
  done(null, obj);
});

// Routes
app.get('/', function(req, res){
  console.log(req.session.myid);
  res.render('index', { title: 'Data Sucks' });
});

//Use this route to authenticate Twitter users
app.get('/auth/twitter', passport.authenticate('twitter'));

//Use this route as the callback for the Twitter authentication.
app.get('/auth/twitter/callback', passport.authenticate('twitter'),
  function(req,res){
  	if(req.user){
  		console.log("!!!!");
  		console.log(req.user);
  		console.log(req.session.myid);
  		
  		twitter.query()
      	  .get('friends/ids')
      	  .qs({user_id: req.user.id})
      	  .auth(req.user.token,req.user.tokenSecret)
      	  .request(function(err, res, body){
      		//twitterUser.friendIDs = body.ids;
      		console.log(body);
        	body.ids.forEach(function(element,index,array){
          	checkTwitterUser(req.user.token, req.user.tokenSecret, element, req);
        });
      });
  		
  	}
  	else{
  		console.log(":(");
  	}
  }); //failing is actually succeding


//Test success
app.get('/auth/twitter/failure', function(req,res){
  console.log(req.user);
  res.redirect('/');
});

//Test fail
app.get('/auth/twitter/success', function(req,res){
  res.render('twitter');
  
});

app.get('/tUsers', function(req,res){
	mongoose.model('TwitterUser').find(function(err,twitterUsers){
    	res.json(twitterUsers);
    });
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
  console.log(req.session);
  res.render('facebook');
});

app.get('/fbUsers', function(req,res){
  mongoose.model('FacebookUser').find(function(err,facebookUsers){
    res.json(facebookUsers);
  });
});

app.get('/fbFriends', function(req,res){
	console.log(req.session);
	FacebookUser.findOne({'fbID' : '10204974940035158'}, function(err,user){
		res.send(user.friends);
	});

});

app.post('/auth/local',
  passport.authenticate('local', { successRedirect: '/newsession',
                                   failureRedirect: '/test',
                                   failureFlash: true })
);

app.get('/newsession',function(req,res){
	req.session.myid = req.user._id;
	res.redirect('/');
});

app.get('/test', function(req, res){
	if(req.user)
	  res.send("OK");
	else
	  res.render('front.jade');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(5000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
