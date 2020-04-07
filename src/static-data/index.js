'use strict';

const { createElasticStaticData } = require('./elastic');

module.exports = { createAllStaticData };

async function createAllStaticData({ forceDeletion = false } = {}) {
	try {
		await createElasticStaticData({ forceDeletion });
	} catch (err) {
		console.error('error creating static data', err);
	}
}
