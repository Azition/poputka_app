const express = require('express');
const router = express.Router();
const entry_point = require('../actions/entry_point_handler');

router.use(function(req, res, next) {
	console.log(
		'Time: ', new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
		' URL: ', req.originalUrl
	);
	console.log('Request', JSON.stringify(req.body, null, 2));
	next();
});

router.get('/', function(req, res) {
	res.json({
		'message': 'Hello world!'
	});
});

router.post('/', function(req, res) {
	entry_point(req.body, res);
})

module.exports = router;