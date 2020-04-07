'use strict';

const createService = require('../../elasticsearch/service');
const { tokenizeString, generateId } = require('../domain-utilities');

const index = 'people';
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
				firstName: { type: 'keyword' },
				lastName: { type: 'keyword' },
				location: { type: 'geo_point' },
				salary: { type: 'double' },
				dateOfBirth: { type: 'date' },
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

/** @param {import('../../../../admin-web/globals').Manufacturer} manufacturer*/
function getSuggestions(manufacturer) {
	let suggestions = [];
	suggestions = suggestions.concat(tokenizeString(manufacturer.name));
	return suggestions;
}
