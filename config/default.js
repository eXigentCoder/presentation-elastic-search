'use strict';
const appName = require('../package.json').name;

module.exports = function () {
	return {
		port: 3123,
		elasticSearch: {
			host: 'localhost',
			port: 9200,
			protocol: 'http',
			username: 'elastic',
			password: 'changeme',
		},
	};
};
