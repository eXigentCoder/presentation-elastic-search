'use strict';

const createService = require('../../elasticsearch/service');
const { tokenizeString, generateId } = require('../domain-utilities');
const peopleService = require('../people/service');
const index = 'meetings';
const service = createService({ index });

module.exports = {
	createIndexAndMapping,
	refresh: service.refresh,
	create,
	replace,
	autocomplete,
	get: get,
	search: search,
	remove: service.remove,
	ensureIndexDeleted: service.ensureIndexDeleted,
};

async function createIndexAndMapping() {
	await service.createIndexAndMapping({
		mappingBody: {
			properties: {
				subject: { type: 'keyword' },
				startDate: { type: 'date' },
				endDate: { type: 'date' },
				durationMinutes: { type: 'double' },
				costUSD: { type: 'double' },
				costZAR: { type: 'double' },
				attendees: {
					properties: {
						userId: { type: 'keyword' },
						accepted: { type: 'boolean' },
					},
				},
				suggest: {
					type: 'completion',
				},
			},
		},
	});
}
async function get({ _id, hydrate = true }) {
	const item = await service.get({ _id });
	if (hydrate) {
		await rehydrate(item);
	}
	return item;
}

async function search(params) {
	const items = await service.search(params);
	// for (const item of items) {
	// 	await rehydrate(item);
	// }
	return items;
}
async function autocomplete(params) {
	const items = await service.autocomplete(params);
	for (const item of items) {
		await rehydrate(item);
	}
	return items;
}

async function rehydrate(item) {
	const hydratedAttendees = [];
	for (const attendee of item.attendees) {
		const populated = await peopleService.get({ _id: attendee.userId });
		populated.accepted = attendee.accepted;
		hydratedAttendees.push(populated);
	}
	item.attendees = hydratedAttendees;
}
function dehydrate(item) {
	item.attendees = item.attendees.map((attendee) => {
		return { userId: attendee._id, accepted: true };
	});
}

async function create({ item }) {
	const _id = generateId(item.name);
	const suggest = getSuggestions(item);
	dehydrate(item);
	return await service.create({ _id, item: { ...item, suggest } });
}

async function replace({ _id, item }) {
	const suggest = getSuggestions(item);
	dehydrate(item);
	return await service.replace({ _id, item: { ...item, suggest } });
}

function getSuggestions(meeting) {
	let suggestions = [];
	suggestions = suggestions.concat(tokenizeString(meeting.subject));
	for (const person of meeting.attendees) {
		suggestions = suggestions.concat(tokenizeString(person.firstName));
		suggestions = suggestions.concat(tokenizeString(person.lastName));
	}
	return suggestions;
}
