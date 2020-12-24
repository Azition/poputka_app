const handler_delecter = require('./handler_detect');

module.exports = async function(body, res) {
	const req_type = body['type'];

	switch (req_type) {
		case 'confirmation':
			res.send(process.env['CONFIRM_KEY'] || '');
			break;

		case 'message_new':
			const obj = body['object'];
			const msg = obj['message'];
			const client_info = obj['client_info'];
			const payload = JSON.parse(msg['payload'] || '{"command": false, "data": {}}');
			const handler = await handler_delecter(payload);
			handler(msg, client_info);
			res.send("ok");
			break;

		default:
			res.send("ok");
	}
}