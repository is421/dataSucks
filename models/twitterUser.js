var mongoose = require('mongoose');
 
module.exports = mongoose.model('TwitterUser',{
    name: String,
    screenName: String,
    profileLink: String,
    tID: String,
});