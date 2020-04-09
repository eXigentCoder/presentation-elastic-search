'use strict';
const config = require('./config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { createAllStaticData } = require('./static-data');
const baseRouter = require('./express/base-router');
const { router: meetingsRouter } = require('./domain/meetings');
const { router: peopleRouter } = require('./domain/people');
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', baseRouter);
app.use('/meetings', meetingsRouter);
app.use('/people', peopleRouter);

app.use(function(req, res) {
	console.error('Route not found');
	res.status(404).json({ message: 'No such route' });
});
app.use(function(err, req, res, next) {
	console.error({ err });
	res.status(500).json({ message: 'An error ocurred' });
});

const port = config.get('port');

app.listen(port, async function() {
	await createAllStaticData();
	console.log(`App listening on: http://localhost:${port}`);
});
