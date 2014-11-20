var mongoose = require('mongoose');
 
module.exports = mongoose.model('FacebookUser',{
    name: String,
    profileLink: String,
    gender: String,
    fbID: String,
    friends: [{
    	'name': String,
    	'id': String
    }],
});