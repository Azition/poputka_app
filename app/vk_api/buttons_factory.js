const _ = require('lodash');

class ButtonsFactory {
	constructor(one_time = false, inline = false) {
		this.one_time = one_time;
		this.inline = inline;
		this.buttons = [];
	}

	setOneTime(v) {
		this.one_time = v;
	}

	setInline(v) {
		this.inline = v;
	}

	addButtonInRow(button, row) {
		const __row = row - 1;
		if (_.isEmpty(this.buttons)) {
			this.buttons.push([]);
		}
		if (_.inRange(__row, _.size(this.buttons))) {
			this.buttons[__row].push(button);
		} else if (_.size(this.buttons) == row) {
			this.buttons[__row] = [button];
		} else {
			throw "Выход за границу массива";
		}
	}

	addButtonsInRow(buttons, row) {
		_.each(buttons, (btn) => this.addButtonInRow(btn, row));
	}

	value() {
		return _.cloneDeep({
			one_time: this.one_time,
			buttons: this.buttons,
			inline: this.inline
		})
	}

	static createButton(action, params, color = 'secondary') {
		let __params = {
			'payload': JSON.stringify(params['payload'] || {})
		};

		switch (action) {
			case 'text':
				__params['label'] = params['label'];
				break;
			case 'open_link':
				__params['link'] = params['link'];
				__params['label'] = params['label'];
				break;
			case 'location':
				break;
			case 'vkpay':
				__params['hash'] = params['hash'];
				break;
			case 'open_app':
				__params['hash'] = params['hash'];
				__params['label'] = params['label'];
				__params['app_id'] = params['app_id'];
				__params['owner_id'] = params['owner_id'];
				break;
			case 'callback':
				__params['label'] = params['label'];
				break;
		}

		return {
			action: {
				type: action,
				...__params
			},
			color
		}
	}

	static getTextButton(label, payload, color='secondary') {
		return this.createButton('text', {
			label, payload
		}, color);
	}

	static getLinkButton(label, link, payload, color='secondary') {
		return this.createButton('open_link', {
			label, link, payload
		}, color);
	}

	static getLocationButton(payload, color='secondary') {
		return this.createButton('location', {
			payload
		}, color);
	}

	static getVkPayButton(hash, payload, color='secondary') {
		return this.createButton('vkpay', {
			hash, payload
		}, color);
	}

	static getVkAppsButton(appID, ownerID, label, hash, payload, color='secondary') {
		return this.createButton('open_app', {
			app_id: appID,
			owner_id: ownerID,
			payload,
			hash,
			label
		}, color);
	}

	static getCallbackButton(label, payload, color='secondary') {
		return this.createButton('callback', {
			label, payload
		}, color);
	}
}

module.exports = ButtonsFactory;