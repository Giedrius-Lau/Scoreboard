const config = require('./config');
const port = config.httpPort || process.env.PORT || 8080;
const app = require('./app')(config);

app.listen(port, function(error) {
	if (error) throw error;
});
