const _ = require('lodash');
const vk_url = process.env['VK_URL'] || '';
const access_token = process.env['ACCESS_TOKEN'] || '';
const api_version = process.env['VK_API_VERSION'] || '';
const { stringify } = require('querystring');
const axios = require('axios');

const __callApiMethod = async function(method_name, params = {}) {
	const __params = {
		v: api_version,
		access_token: access_token,
		...params
	};
	const { data } = await axios.post(`${vk_url}/${method_name}`, stringify(__params));
	console.log('Result ', JSON.stringify(data, null, 4));
	return data;
}

module.exports = {
	sendMessage: function(user_id, message, keyboard, override = {}) {
		return __callApiMethod('messages.send', {
			user_id,
			peer_id: user_id,
			message: message || '',
			keyboard: JSON.stringify(keyboard  || {}),
			random_id: Date.now(),
			...override
		})
	},
	getUser: async function(user_ids) {
		var __user_ids;
		if (_.isArray(user_ids)) {
			__user_ids = user_ids.join();
		} else {
			__user_ids = user_ids;
		}
		return await __callApiMethod('users.get', {
			user_ids: __user_ids
		});
	}
}