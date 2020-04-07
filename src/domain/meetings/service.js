'use strict';

const createService = require('../../elasticsearch/service');
const { tokenizeString, generateId } = require('../domain-utilities');

const index = 'meetings';
const service = createService({ index });

module.exports = {
	createIndexAndMapping,
	refresh: service.refresh,
	create,
	replace,
	autocomplete: service.autocomplete,
	get: service.get,
	search: service.search,
	remove: service.remove,
	ensureIndexDeleted: service.ensureIndexDeleted,
};

async function createIndexAndMapping() {
	await service.createIndexAndMapping({
		mappingBody: {
			properties: {
				subject: { type: 'keyword' },
				startDate: { type: 'date' },
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

async function create({ item }) {
	const _id = generateId(item.name);
	const suggest = getSuggestions(item);
	return await service.create({ _id, item: { ...item, suggest } });
}

async function replace({ _id, item }) {
	const suggest = getSuggestions(item);
	return await service.replace({ _id, item: { ...item, suggest } });
}

function getSuggestions(meeting) {
	let suggestions = [];
	suggestions = suggestions.concat(tokenizeString(meeting.subject));
	return suggestions;
}
