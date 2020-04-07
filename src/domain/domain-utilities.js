'use strict';
const uuid = require('uuid');
const kebabCase = require('lodash/kebabCase');

function tokenizeString(text) {
	if (!text) {
		return [];
	}
	const tokens = text.trim().split(' ');
	return tokens;
}

function generateId(name = '') {
	if (name) {
		return kebabCase(name);
	}
	return uuid.v4();
}

module.exports = { tokenizeString, generateId };
