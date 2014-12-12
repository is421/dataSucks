
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
    YahooStrategy = require('passport-yahoo-oauth').Strategy,
    WindowsLiveStrategy = require('passport-windowslive').Strategy,
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
    }),
    Imap = require('imap'),
    inspect = require('util').inspect;



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

mongoose.connect('mongodb://localhost/project');

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
//set up windows live
passport.use(new WindowsLiveStrategy({
    clientID: '000000004C130C10',
    clientSecret: 'GBikyqhEjN0R9D5VYahITL4R5hcP1MEx',
    callbackURL: "http://puppet.srihari.guru/auth/windowslive/callback?"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    return done(null,false);
  }
));


//set up yahoo strategy
passport.use(new YahooStrategy({
    consumerKey: 'dj0yJmk9ZTFRUnBycUQ0aEtNJmQ9WVdrOVNuZGljRlZKTXpJbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD03ZA--',
    consumerSecret: 'aa77244f39a74a0a068049df82f1626c643c55d4',
    callbackURL: "http://puppet.srihari.guru/auth/yahoo/callback"
  },
  function(token, tokenSecret, profile, done) {
    console.log(profile);
    return done(null,false);
  }
));




//Setup the Twitter strategy
//When this gets a little more serious, refrain from showing
//sensitive information like the consumer key and secret.
passport.use(new TwitterStrategy({
    consumerKey: "EUGbXnHc7TSlFZxkHp69i0l7y",
    consumerSecret: "fSmqoroZtrybNHYSehI0U3iEWoPzHNLSz6Nxb4EyLoHAxxiGIZ",
    callbackURL: "http://puppet.srihari.guru/auth/twitter/callback",
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
      Identity.findOrCreate({belongsTo: req.session.myid}, function(err,iden){
      	if(err) { return done(err); }
      	iden.Twitter = body.screen_name;
      	iden.save();
      })
    });
    
  //
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
    callbackURL: "http://puppet.srihari.guru/auth/facebook/callback"
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
    clientID: "1069961481861-6suv06q4hrq9mt7oi7eu54tfjgkth89c.apps.googleusercontent.com",
    clientSecret: "I8eLUjYT-FOtqnwadxcAgQJD",
    callbackURL: "http://puppet.srihari.guru/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
  

      var googleUser = new GoogleUser();
      googleUser.name = profile.displayName;
      googleUser.email = profile._json['email'];
      googleUser.profileLink = profile._json['link'];
      googleUser.picture = profile._json['picture'];
      googleUser.gender = profile._json['gender'];
      googleUser.gID = profile._json['id'];
	console.log(googleUser);
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


//test imap

app.get('/imap',function(req,res){
	res.render('imap');
});

app.post('/imapsuck',function(req,res){

	
	var imap = new Imap({
	  user: req.body.username,
	  password: req.body.password,	
  	  host: 'imap.gmail.com',
      port: 993,
      tls: true
    });
    
    function openInbox(cb) {
  		imap.openBox('INBOX', true, cb);
	}
	
	imap.once('ready', function() {
  		openInbox(function(err, box) {
    		if (err) throw err;
    		var f = imap.seq.fetch('1:10000', {
      			bodies: 'HEADER.FIELDS (FROM)',
      			struct: true
    	});
    	f.on('message', function(msg, seqno) {
      		//console.log('Message #%d', seqno);
      		var prefix = '(#' + seqno + ') ';
     		msg.on('body', function(stream, info) {
        	var buffer = '';
        	stream.on('data', function(chunk) {
          	buffer += chunk.toString('utf8');
        });
        stream.once('end', function() {
          //console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
          var temp = inspect(Imap.parseHeader(buffer));
          //console.log(buffer);
		  buffer = buffer.substring(buffer.indexOf(':')+1,buffer.indexOf(' <'));
		  var em = temp.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
          //console.log(em[0], buffer);
          var emailUser = [em[0],buffer]; //email, name
          
          console.log(emailUser);
          
        });
      });
      msg.once('attributes', function(attrs) {
        //console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
      });
      msg.once('end', function() {
        //console.log(prefix + 'Finished');
      });
    });
    f.once('error', function(err) {
      console.log('Fetch error: ' + err);
    });
    f.once('end', function() {
      console.log('Done fetching all messages!');
      imap.end();
    });
  });
});

imap.once('error', function(err) {
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();
});
//microsoft
app.get('/auth/windowslive',passport.authenticate('windowslive'));

app.get('/auth/yahoo/callback',passport.authenticate('yahoo', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/auth/windowslive/callback', passport.authenticate('windowslive', { 
  successRedirect: '/',
  failureRedirect: '/auth/windowslive/success' 
}));

app.get('/auth/windowslive/success', function(req,res){
  res.send('woooo');
});

//yahoo routes 

app.get('/YjfAAjxCJBtnSRIQbZzAWlwPRLx.IQbuk9lgxqw5DQ--.html', function(req,res) {
	res.send('yo');
});


app.get('/auth/yahoo',passport.authenticate('yahoo'));


app.get('/auth/yahoo/callback', passport.authenticate('yahoo', { 
  successRedirect: '/auth/yahoo/success',
  failureRedirect: '/' 
}));

app.get('/auth/yahoo/success', function(req,res){
  console.log('success');
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
      	  .qs({user_id: profile.id})
      	  .auth(token,tokenSecret)
      	  .request(function(err, res, body){
      		twitterUser.friendIDs = body.ids;
      		console.log(body);
        	body.ids.forEach(function(element,index,array){
          	checkTwitterUser(token, tokenSecret, element, req);
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

app.listen(80, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
