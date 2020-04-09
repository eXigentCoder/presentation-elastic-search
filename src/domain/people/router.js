'use strict';
const express = require('express');
const router = express.Router();
const { create, get, search, autocomplete, remove, replace } = require('./service');
const asyncHandler = require('express-async-handler');

router.get(
	'/autocomplete',
	asyncHandler(async function(req, res) {
		const suggestions = await autocomplete({
			prefix: req.query.prefix,
			fuzziness: Number(req.query.fuzz),
		});
		res.json(suggestions);
	}),
);

router.post(
	'/',
	asyncHandler(async function(req, res) {
		const item = await create({ item: req.body });
		res.status(200).json(item);
	}),
);

router.get(
	'/:id',
	asyncHandler(async function(req, res) {
		const item = await get({ _id: req.params.id });
		res.status(200).json(item);
	}),
);

router.get(
	'/',
	asyncHandler(async function(req, res) {
		const items = await search({ searchBody: req.query });
		res.status(200).json(items);
	}),
);
router.put(
	'/:id',
	asyncHandler(async function(req, res) {
		const item = await replace({ _id: req.params.id, item: req.body });
		res.status(200).json(item);
	}),
);

router.delete(
	'/:id',
	asyncHandler(async function(req, res) {
		await remove({ id: req.params.id });
		res.status(200).json({ deleted: true });
	}),
);
module.exports = { router };
