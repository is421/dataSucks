
/**
 * Module dependencies.
 */

var express = require('express'), 
    routes = require('./routes'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    request = require('request'),
    http = require('http'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    Purest = require('purest')
    facebook = new Purest({provider : 'facebook'}),
    twitter = new Purest({
      provider:'twitter',
      key:'EUGbXnHc7TSlFZxkHp69i0l7y',
      secret:'fSmqoroZtrybNHYSehI0U3iEWoPzHNLSz6Nxb4EyLoHAxxiGIZ',    
    }),
    Imap = require('imap'),
    inspect = require('util').inspect,
    url = require('url');



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
	firstName: String,
	lastName: String,
	email: String,
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



//Setup the Twitter strategy
//When this gets a little more serious, refrain from showing
//sensitive information like the consumer key and secret.
passport.use(new TwitterStrategy({
    consumerKey: "EUGbXnHc7TSlFZxkHp69i0l7y",
    consumerSecret: "fSmqoroZtrybNHYSehI0U3iEWoPzHNLSz6Nxb4EyLoHAxxiGIZ",
    callbackURL: "http://puppet.srihari.guru/auth/twitter/callback",
  },
  function(token, tokenSecret, profile, done) {
    
   
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

	//Let's try to find existing identities and merge them

	//Twitter doesn't give us email, so let's try searching by name.
	//Twitter only gives us the full name

	console.log("Checking for twitter identities...");

	Identity.findOne({belongsTo: req.session.myid, name: body.name}, function(err,iden){
		if(err){
				console.log("Oh man, something awful happened. You won't believe it.");
			}
		//We found it!
		//need to check if iden isn't undefined
		if(iden){
			console.log("Found " + iden.name + " using name: " + body.name);
			iden.Twitter = body.screen_name;
			iden.save();
			found = true;
		}
	});

	//We couldn't find it. Let's try parsing the full name into a first and last name,
	//maybe we'll have more success that way.
	
	var nameArray = body.name.split(" ", 2);
	
	if(!found){
		Identity.findOne({belongsTo: req.session.myid, firstName: nameArray[0], lastName: nameArray[1]}, function(err,iden){
			if(err){
				console.log("Oh man, something awful happened. You won't believe it.");
			}
			
			//We found it!
			if(iden){
				console.log("Found " + iden.name + " using first and last name: " + nameArray[0] + " " + nameArray[1]);
				iden.Twitter = body.screen_name;
				iden.save();
				found = true;
			}
		});
	}
	
	//We couldn't find it...

	if(!found){
	  console.log("Making new identitiy for : " + body.name);
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
    callbackURL: "http://puppet.srihari.guru/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {

	
   
    var user = {
    	"token": accessToken,
    	//"secret": tokenSecret,
    	"profile": profile,
	//"token": token,
	//"tokenSecret": tokenSecret,
    }; 
    
    return done(null,user);  
  }
));


passport.serializeUser(function(user,done){
  done(null, user);
});

passport.deserializeUser(function(obj,done){
  done(null, obj);
});

// Routes
app.get('/', function(req, res){
  if(req.user)
    res.redirect('/dashboard');
  else
    res.render('front', {});
  
});


//test imap

app.get('/imap',function(req,res){
	res.render('imap');
});

app.post('/imapsuck',function(req,res){

	
	var imap = new Imap({
	  user: req.body.username,
	  password: req.body.password,	
  	  host: req.body.host,
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
          
          emailIdentity(emailUser,req.session.myid);
          
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
  
  res.redirect('/dashboard');
});

imap.once('error', function(err) {
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();
});

function emailIdentity(emailUser, myID){
	
	//emailUser[0] = email emailUser[1] = name
	
	//Let's try to search by name first.
	Identity.findOne({belongsTo: myID, name: emailUser[1]}, function(err,iden){
					
		//We found it!
		if(iden){
			console.log("Found " + iden.name + " using name: " + emailUser[1]);
			if(!iden.email){
				iden.update({
					email: emailUser[0],
				},function(err){
					if(err) console.log(err);
				});
							
			}
			return;
		}
	});
	
	//What about searching by email?
	Identity.findOne({belongsTo: myID, email: emailUser[0]}, function(err,iden){
					
		//We found it!
		if(iden){
			console.log("Found " + iden.name + " using email: " + emailUser[0]);
			if(!iden.name){
				iden.update({
					name: emailUser[1],
				},function(err){
					if(err) console.log(err);
				});
							
			}
			return;
		}
	});
	
	//Couldn't find this person. We should make a new identity.
	
	Identity.create({
		name: emailUser[1],
		belongsTo: myID,
		email: emailUser[0],
	}, function(err){
		if(err)
		  console.log("Error saving new email identity");
	});
	
}

//Use this route to authenticate Twitter users
app.get('/auth/twitter', passport.authenticate('twitter'));

//Use this route as the callback for the Twitter authentication.
app.get('/auth/twitter/callback', passport.authenticate('twitter'),
  function(req,res){
  	if(req.user){
  		
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
  		console.log("Could not identify user!");
  	}
  	
  	res.redirect('/dashboard');
  });


//Test success
app.get('/auth/twitter/failure', function(req,res){
  console.log('Twitter authorization failed!');
  res.redirect('/dashboard');
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

//Facebook routes
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['read_stream', 'publish_actions','email','user_friends'] }));


app.get('/auth/facebook/callback', passport.authenticate('facebook'),function(req,res){

	if(req.user){
  		
  		console.log("Going to query some Facebook friends");
  		
  		facebook.query()
  		  .get('/' + req.user.profile.id + '/friends')
  		  .auth(req.user.token)
  		  .request(function(err,res,body){
  		  	
  		  	body.data.forEach(function(element,index,array){
  		  		console.log(element['name']);
  		  		
  		  		var found = false;

				//Search for identities that may match the person we found.
				
				//Facebook gives us email, so let's try using that first
				
				Identity.findOne({belongsTo: req.session.myid, email: element['email']}, function(err,iden){
					
					//We found it!
					if(iden){
						console.log("Found " + iden.name + " using email: " + element['email']);
						iden.Facebook = element['name'];
						iden.save();
						found = true;
					}
				});
				
				//Maybe we can search by name...
				if(!found){
					Identity.findOne({belongsTo: req.session.myid, name: element['name']}, function(err,iden){
					
						//We found it!
						if(iden){
							console.log("Found " + iden.name + " using name: " + element['name']);
							iden.Facebook = element['name'];
							iden.firstName = element['first_name'];
							iden.lastName = element['last_name'];
							iden.save();
							found = true;
						}
					});
				}
				
				//What about first and last name separate?
				if(!found){
					Identity.findOne({belongsTo: req.session.myid, firstName: element['first_name'], lastName: element['last_name']}, function(err,iden){
					
						//We found it!
						if(iden){
							console.log("Found " + iden.name + " using first and last name: " + element['first_name'] + " " + element['last_name']);
							iden.Facebook = element['name'];
							iden.save();
							found = true;
						}
					});
				}
				
			   
			   //We couldn't find it...'
				if(!found){
				  console.log("Making a new identity for " + element['name']);
				  Identity.create({
				    name: element['name'],
				    firstName: element['first_name'],
				    lastName: element['last_name'],
				    belongsTo: req.session.myid,
				    Facebook: element['name'],
				}, function(err, newFacebook){
					if(err)
					  console.log("Error saving Facebook identity");
				   });
			    }
  		  		
  		  	});
  		  	
  		  });
  		
  	}
  	else{
  		console.log("Could not establish identity!");
  	}
  	
  	res.redirect('/dashboard');
});



app.get('/auth/facebook/success', function(req,res){
  //console.log(req.session);
  res.redirect('/dashboard');
});

app.get('/fbUsers', function(req,res){
  mongoose.model('FacebookUser').find(function(err,facebookUsers){
    res.json(facebookUsers);
  });
});

app.get('/fbFriends', function(req,res){
	//console.log(req.session);
	FacebookUser.findOne({'fbID' : '10204974940035158'}, function(err,user){
		res.send(user.friends);
	});

});

app.post('/auth/local',
  passport.authenticate('local', { successRedirect: '/newsession',
                                   failureRedirect: '/',
                                   failureFlash: true })
);

app.post('/auth/newaccount', function(req,res){
	
	console.log(req.body.username);
	console.log(req.body.password);
	console.log(req.body.password2);

	if(req.body.email != '' && req.body.password != '' && req.body.password2 != ''){
		if(req.body.password == req.body.password2){
			User.create({
				username: req.body.username,
				password: req.body.password,
			}, function(err, newAccount){
				if(err)
				  console.log("Error making new account");
			});
		}
		else{
			res.redirect('/signup');
		}
		
	}
	else{
		res.redirect('/signup');
	}
	
	res.redirect('/');
});

app.get('/newsession',function(req,res){
	req.session.myid = req.user._id;
	res.redirect('/dashboard');
});

app.get('/test', function(req, res){
	if(req.user)
	  res.send("OK");
	else
	  res.render('front.jade');
});

app.get('/signup', function(req,res){
	res.render('signup');
});

app.get('/about', function(req,res){
	res.render('about');
});

app.get('/contactus', function(req,res){
	res.render('contactus');
});

app.get('/dashboard', function(req,res){
	if(req.session.myid){
		console.log(req.session.myid);
		res.render('dashboard');
	}
	else{
		res.redirect('/');
	}
	
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(80, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
