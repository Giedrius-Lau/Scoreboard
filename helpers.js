'use strict';

const util = require('util');
const winston = require('winston');
const config = require('./config');
const packageJson = require('./package.json');

const helpers = {};

helpers.asyncMiddleware = function(fn) {
	return function(req, res, next) {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

helpers.validateId = function(id) {
	if (!/^[0-9a-f]{24}$/.test(id)) {
		throw new ValidationError('FieldIsInvalid: id');
	}
};

function ValidationError(extra) {
	Error.captureStackTrace(this, ValidationError);
	this.message = 'ValidationError';
	this.extra = extra;
}
util.inherits(ValidationError, Error);
ValidationError.prototype.name = 'ValidationError';

let logger = new winston.Logger({
	transports: [new winston.transports.Console()]
});

let accessLogger;

if (config.logstashHost) {
	require('winston-logstash');

	const logstashLogs = new winston.transports.Logstash({
		port: 28777,
		node_name: `${packageJson.name}-logs`,
		host: config.logstashHost,
		max_connect_retries: 24 * 60,
		timeout_connect_retries: 60 * 1000
	});

	logstashLogs.on('error', error => {
		helpers.log('error', error.message, { error });
	});

	logger = new winston.Logger({
		transports: [logger.transports.console, logstashLogs]
	});

	if (config.logstashAccessLogs) {
		const logstashAccessLogs = new winston.transports.Logstash({
			port: 28777,
			node_name: `${packageJson.name}-access`,
			level: 'debug',
			host: config.logstashHost,
			max_connect_retries: 24 * 60,
			timeout_connect_retries: 60 * 1000
		});

		logstashAccessLogs.on('error', error => {
			helpers.log('error', error.message, { error });
		});

		accessLogger = new winston.Logger({
			transports: [logstashAccessLogs]
		});
	}
}

function log(level, message, { error, req, data, status } = {}) {
	const info = {
		status,
		data,
		hostname: require('os').hostname(),
		extra: error && error.extra,
		stack: error && error.stack
	};

	req &&
		Object.assign(info, {
			url: req.url,
			agent: req.headers && req.headers['user-agent'],
			referer: req.headers && req.headers['referer'],
			query: req.query,
			body: stripSensitiveInfo(req.body),
			route: req.method.toLowerCase() + ' ' + ((req.route && req.route.path) || req.path),
			ip: (req.headers && req.headers['x-forwarded-for']) || req.connection.remoteAddress,
			user: req.user && req.user._id.toString()
		});

	logger.log(level, message, info);
}
helpers.log = log;

function stripSensitiveInfo(o) {
	if (!o) return o;
	if (typeof o !== 'object') return o;
	if (o.hasOwnProperty('password')) {
		return Object.assign({}, o, { password: '*masked*' });
	}
	return o;
}

process.on('uncaughtException', error => {
	helpers.log('error', error.message, { error });
	setTimeout(() => process.exit(1), 500);
});

helpers.logAccess = function(app) {
	return function handle(req, res, next) {
		const startAt = process.hrtime();
		if (!accessLogger) {
			return next();
		}

		const path = req.path;
		const prevBytesWritten = req.socket.bytesWritten;

		res.on('finish', function() {
			const method = req.method.toLowerCase();
			const endAt = process.hrtime();
			const duration = Math.floor((endAt[0] - startAt[0]) * 1e3 + (endAt[1] - startAt[1]) * 1e-6);
			const route = method + ' ' + (findRouteName(app._router, method, path) || path);
			const written = req.socket.bytesWritten - prevBytesWritten;
			let read = req.body ? JSON.stringify(req.body).length : 0;
			read = read === 2 ? 0 : read;

			accessLogger.log('debug', 'access', {
				route,
				url: req.url,
				status: res.statusCode,
				time: duration,
				written,
				read,
				ip: (req.headers && req.headers['x-forwarded-for']) || req.connection.remoteAddress
			});
		});

		next();
	};
};

function findRouteName(router, method, path) {
	for (var layer of router.stack) {
		if (layer.handle && layer.handle.stack) {
			if (layer.regexp.test(path)) {
				var deepPath = path.replace(layer.regexp, '') || '/';
				var pathStart = path.match(layer.regexp)[0];
				var name = findRouteName(layer.handle, method, deepPath);
				if (name) {
					return pathStart + name;
				}
			}
		} else if (layer.route) {
			if (layer.route.methods[method] && layer.regexp.test(path)) {
				return layer.route.path;
			}
		} else {
			var match = path.match(layer.regexp);
			if (match && match[0]) {
				return match[0];
			}
		}
	}

	return null;
}

module.exports = helpers;
