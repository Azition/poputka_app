module.exports = function(body, res) {
	if (body['type'] === 'confirmation') {
		return res.send(process.env['CONFIRM_KEY'] || '');
	}

	return res.json({
		'message': 'success request'
	})
}