const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const extension = require('path').extname;
const { log, logAccess } = require('./helpers');

module.exports = function App(config) {
	assert(config, 'config is required');

	require('./bin/mongo-connect');

	const app = express();
	app.disable('x-powered-by');
	app.set('etag', false);

	if (process.env.NODE_ENV === 'production') {
		app.use(serveDir('./app/build'));
		app.use('/admin', serveDir('./app-admin/build'));
	} else {
		require('./seed')().catch(e => log('error', `error while seeding: ${e.message}`));
	}

	if (config.logstashAccessLogs) {
		app.use(logAccess(app));
	}

	app.use(bodyParser.json({ strict: true }));
	app.use(require('./routes'));

	if (process.env.NODE_ENV === 'production') {
		app.use(function(req, res, next) {
			res.sendFile(__dirname + '/app/public/index.html');
		});
	}

	return app;
};

function serveDir(path) {
	return express.static(path, {
		maxAge: 31708800000,
		setHeaders: function(res, path) {
			if (extension(path) === '.html') {
				res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
				res.header('Expires', '-1');
				res.header('Pragma', 'no-cache');
			} else {
				res.header('Expires', new Date(Date.now() + 31708800000).toUTCString());
			}
		},
		etag: false,
	});
}
