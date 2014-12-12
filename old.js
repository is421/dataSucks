//commented out code that isn't being used but may be important. 
//Check commit history for reimplementing


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
   


/*
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
    */
   
