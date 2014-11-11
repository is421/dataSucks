module.exports = function (app) {
	var index = require('./routes/index');

	app.get('/', index.index);
}