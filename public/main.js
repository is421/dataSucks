hello.on('auth.login', function(auth){
	
	// call user information, for the given network
	hello( auth.network ).api( '/me' ).then( function(r){
		// Inject it into the container
		var label = document.getElementById( "profile_"+ auth.network );
		if(!label){
			label = document.createElement('div');
			label.id = "profile_"+auth.network;
			document.getElementById('profile').appendChild(label);
		}
		label.innerHTML = '<img src="'+ r.thumbnail +'" /> Hey '+r.name;
	});
});

hello.init({ 
	facebook : 1571117689785844,
},{redirect_uri:'redirect.html'});

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '1571117689785844',
      xfbml      : true,
      version    : 'v2.2'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
  