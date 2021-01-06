const handler_delecter = require('./handler_detect');
const callback_detecter = require('./callback_detect');

module.exports = async function(body, res) {
	const req_type = body['type'];
	let obj, payload, handler;

	switch (req_type) {
		case 'confirmation':
			res.send(process.env['CONFIRM_KEY'] || '');
			break;

		case 'message_new':
			obj = body['object'];
			let msg = obj['message'];
			let client_info = obj['client_info'];
			payload = JSON.parse(msg['payload'] || '{"command": false, "data": {}}');
			handler = await handler_delecter(payload);
			handler(msg, client_info);
			res.send("ok");
			break;

		case 'message_event':
			obj = body['object'];
			payload = obj['payload'] || {};
			handler = await callback_detecter(payload);
			handler(obj);
			res.send("ok");
			break;

		default:
			res.send("ok");
	}
}