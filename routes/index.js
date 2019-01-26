const router = require('express').Router();
const config = require('../config');
const log = require('../helpers').log;

router.use(function(req, res, next) {
	const THRESHOLD = config.slowApiResponseThresholdMs || 5000;
	const start = Date.now();

	res.on('finish', function() {
		const duration = Date.now() - start;
		if (duration >= THRESHOLD) {
			log('warn', 'SLOW RESPONSE', {
				req,
				data: {
					duration,
					originalUrl: req.originalUrl,
					threshold: THRESHOLD
				}
			});
		}
	});

	next();
});

router.use('/api', require('./api'));

module.exports = router;
