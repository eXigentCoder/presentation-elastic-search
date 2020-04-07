'use strict';

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const moment = require('moment');
const packageJson = require('../../package.json');
const config = require('../config');
const { createAllStaticData } = require('../static-data');
module.exports = router;

router.get('/', function health(req, res) {
	const humanReadableUptime = moment
		.utc()
		.subtract(process.uptime(), 'seconds')
		.fromNow();
	res.json({
		version: packageJson.version,
		environment: config.get('NODE_ENV'),
		uptime: process.uptime(),
		humanReadableUptime: humanReadableUptime,
	});
});

router.all(
	'/reindex',
	asyncHandler(async function reindex(req, res) {
		await createAllStaticData({ forceDeletion: true });
		res.status(200).send();
	}),
);
