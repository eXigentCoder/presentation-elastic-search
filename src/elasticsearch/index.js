'use strict';

const elasticsearch = require('elasticsearch');
const config = require('@bit/exigentcoder.common-modules.config');

const elasticConfig = config.get('elasticSearch');

module.exports = { elasticClient };

let client;

/**
 * @returns {import('elasticsearch').Client}
 */
function elasticClient() {
	if (client) {
		return client;
	}
	return new elasticsearch.Client({
		hosts: [
			{
				host: elasticConfig.host,
				auth: `${elasticConfig.username}:${elasticConfig.password}`,
				protocol: elasticConfig.protocol,
				port: elasticConfig.port,
			},
		],
	});
}
