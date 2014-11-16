var mongoose = require('mongoose');
 
module.exports = mongoose.model('GoogleUser',{
    name: String,
    email: String,
    profileLink: String,
    picture: String,
    gender: String,
    gID: String,
});