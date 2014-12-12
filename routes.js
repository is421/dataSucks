module.exports = function (app) {
	var index = require('./routes/index'),
		login = require('./routes/login'),
		passport = require('passport'),
		passportLocal = require('passport-local'),
	    passportF = require('passport-facebook'),
	    passportG = require('passport-google'),
	    cookieParser = require('cookie-parser'),
	    expressSession = require('express-session');

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new passportLocal.Strategy(function(username,password,done){
  	done(null, user);
  	done(null,null);

  }));

	app.get('/', index.index);
	
	app.get('/login', login.login);

	app.post('/login', passport.authenticate('local'), login.auth);
	
}