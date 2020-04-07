'use strict';

const { elasticClient } = require('./');
const { omit } = require('lodash');

module.exports = function createService({ index, suggestFieldName = 'suggest' }) {
	async function ensureIndexDeleted() {
		try {
			await elasticClient().indices.delete({ index });
			await wait(500);
			console.log(`[Deleted Index] : ${index}`);
		} catch (err) {
			if (err.statusCode !== 404) {
				console.error(err);
			}
		}
	}

	async function indexExists() {
		try {
			await elasticClient().indices.get({ index });
			return true;
		} catch (err) {
			return false;
		}
	}

	async function createIndexAndMapping({ mappingBody }) {
		if (!(await indexExists())) {
			console.log(`[Creating Index] : ${index}`);
			await elasticClient().indices.create({
				index,
			});
		} else {
			console.log(`[Index Existed] : ${index}`);
		}
		console.log(`[Creating Mapping] : ${index}`);
		await elasticClient().indices.putMapping({
			index,
			body: mappingBody,
		});
		console.log(`[Created Mapping] : ${index}`);
	}

	async function create({ _id, item }) {
		const response = await elasticClient().create({
			index,
			id: _id,
			body: { ...omit(item, '_id') },
		});
		if (response.result == 'created') {
			return mapItem({
				_id: _id,
				index,
				...item,
			});
		}
		//todo error handling
		return response;
	}

	async function replace({ _id, item }) {
		const response = await elasticClient().index({
			index,
			id: _id,
			body: {
				...omit(item, '_id'),
			},
		});
		if (response.result == 'updated') {
			return mapItem({
				_id: _id,
				index,
				...item,
			});
		}
		//todo error handling
		return response;
	}
	async function refresh() {
		await elasticClient().indices.refresh({ index });
	}

	async function autocomplete({ prefix, fuzziness = 2, from = 0, size = 10 }) {
		const results = await elasticClient().search({
			index,
			from,
			size,
			body: {
				suggest: {
					suggestions: {
						prefix,
						completion: {
							field: suggestFieldName,
							fuzzy: {
								fuzziness,
							},
						},
					},
				},
			},
		});
		return results.suggest.suggestions[0].options.map(mapSuggestion);
	}

	async function get({ _id }) {
		try {
			const item = await elasticClient().get({
				index,
				id: _id,
			});
			return mapItem(item);
		} catch (err) {
			if (err.statusCode === 404) {
				//todo boom
				throw new Error(`Item in index ${index} with id ${_id} was not found`);
			}
			throw err;
		}
	}

	async function search({ searchBody = {} } = {}) {
		const { skip = 0, take = 25 } = searchBody;
		let body = {
			query: {
				bool: {
					must: [],
				},
			},
		};
		const must = [];
		Object.entries(omit(searchBody, 'skip', 'take')).forEach(([key, value]) => {
			if (!key || !value) {
				return;
			}
			must.push({ term: { [key]: value } });
		});
		const res = await elasticClient().search({
			index,
			from: skip,
			size: take,
			body: body,
		});
		return res.hits.hits.map(mapItem);
	}

	async function remove({ _id }) {
		return await elasticClient().delete({
			index,
			id: _id,
		});
	}

	return {
		ensureIndexDeleted,
		createIndexAndMapping,
		create,
		replace,
		refresh,
		autocomplete,
		get,
		search,
		remove,
		elasticClient,
		mapSuggestion,
		mapItem,
	};

	function mapSuggestion(item) {
		return {
			...mapItem(item),
			score: item._score,
		};
	}

	function mapItem(item) {
		return {
			_id: item._id,
			index: item._index,
			...omit(item._source ? item._source : item, suggestFieldName),
		};
	}
};

function wait(milliseconds) {
	return new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});
}
