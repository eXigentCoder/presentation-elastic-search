'use strict';

const util = require('util');
const { elasticClient } = require('../elasticsearch');
const faker = require('faker');

const services = {
	meetings: require('../domain/meetings/service'),
	people: require('../domain/people/service'),
};

module.exports = { createElasticStaticData };

const prodWaitTime = 5000;
const devWaitTime = 1000;

async function createElasticStaticData({ forceDeletion = false } = {}) {
	await waitForServer();
	const keys = Object.keys(services);
	if (process.env.NODE_ENV.toLowerCase() === 'development' || forceDeletion) {
		const promises = [];
		for (const key of keys) {
			const service = services[key];
			promises.push(service.ensureIndexDeleted());
		}
		await Promise.all(promises);
		if (process.env.NODE_ENV.toLowerCase() === 'development') {
			await wait(devWaitTime);
		} else {
			await wait(prodWaitTime);
		}
	}
	try {
		const promises = [];
		for (const key of keys) {
			const service = services[key];
			service.createIndexAndMapping();
		}
		await Promise.all(promises);
		if (process.env.NODE_ENV.toLowerCase() === 'development') {
			await wait(devWaitTime);
		} else {
			await wait(prodWaitTime);
		}
	} catch (err) {
		console.error(util.inspect(err, true, null, true));
	}
	const populationMethods = [populatePeople, populateMeetings];
	for (const fn of populationMethods) {
		try {
			await fn();
		} catch (err) {
			console.error(`Error in population function: ${fn.name}\n${err.message}\n${err.stack}`);
		}
	}
}

const state = {
	people: {},
	meetings: {},
};

async function waitForServer(count = 1) {
	if (count === 5) {
		console.error('Unable to connect to elastic search after 5 tries, exiting.');
		process.exit(-1);
	}
	try {
		console.log(`-------------- Trying to get client, count:${count}`);
		const client = elasticClient();
		await client.indices.get({ index: 'products' });
		console.log('-------------- got client');
	} catch (err) {
		if (err.statusCode === 404) {
			console.log('-------------- Connected, index not found, returning');
			return;
		}
		console.error(err);
		console.log('-------------- Error getting client, waiting');
		await wait(prodWaitTime);
		return await waitForServer(count + 1);
	}
}

function wait(milliseconds) {
	return new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});
}
function generateFakePerson() {
	return {
		firstName: faker.name.firstName(),
		lastName: faker.name.lastName(),
		location: {
			lat: faker.address.latitude(),
			lon: faker.address.longitude(),
		},
		salary: faker.random.number({ min: 1000, max: 99999 }),
		dateOfBirth: faker.date.between('1960-01-01', '2002-01-01'),
	};
}

async function populatePeople() {
	const service = services.people;
	const promises = [];
	for (let index = 0; index < faker.random.number({ min: 100, max: 500 }); index++) {
		promises.push(
			service.create({
				item: generateFakePerson(),
			}),
		);
	}
	state.people = await Promise.all(promises);
	await service.refresh();
}

async function populateMeetings() {
	const service = services.meetings;
	await service.refresh();
}
