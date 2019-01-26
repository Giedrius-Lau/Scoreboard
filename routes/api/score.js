'use strict';

const Score = require('../../models/Score');

const { validateId, asyncMiddleware: wrap } = require('../../helpers');
const router = require('express').Router();

router.post(
	'/',
	wrap(async (req, res) => {
		let score = new Score({
			name: req.body.name,
			score: req.body.score
		});

		await score.save();
		res.status(201).json(score);
	})
);

router.get(
	'/',
	wrap(async (req, res) => {
		const { sort } = req.query;
		const fields = 'name score';
		const score = await Score.find()
			.sort(sort)
			.select(fields);

		res.json(score);
	})
);

module.exports = router;
