const _ = require('lodash');
const utils = require('../utils');
const User = require('../models/User');

var driver_list = [];
var user_list = [];
var user_states = [];

const get_user_item = (user_id) => _.find(user_list, (item) => item.isEqualID(user_id));
const get_driver_item = (user_id) => _.find(driver_list, (item) => item.isEqualID(user_id));
const get_user_state_item = (user_id) => _.find(user_states, (item) => item.isEqualID(user_id));

module.exports = {
	addUser: function(user_id, first_name, last_name) {
		const item = get_user_item(user_id);
		if (!item) user_list.push(new User(user_id, first_name, last_name));
	},
	removeUser: function(user_id) {
		_.remove(user_list, (item) => item.isEqualID(user_id));
	},
	addDriver: function(driver_id, first_name, last_name) {
		const item = get_driver_item(driver_id);
		if (!item) driver_list.push(new User(driver_id, first_name, last_name))
	},
	removeDriver: function(driver_id) {
		_.remove(driver_list, (item) => item.isEqualID(driver_id));
	},
	getUserByID: (uid) => get_user_item(uid),
	getDriverByID: (uid) => get_driver_item(uid),
	setUserRoute: function(user_id, route) {
		const item = get_user_item(user_id);
		if (!!item) item.setRoute(route);
	},
	setDriverRoute: function(driver_id, route) {
		const item = get_driver_item(driver_id);
		if (!!item) item.setRoute(route);
	},
	setUserRideDate: function(user_id, date) {
		const item = get_user_item(user_id);
		if (!!item) item.setDate(date);
	},
	setDriverRideDate: function(driver_id, date) {
		const item = get_driver_item(driver_id);
		if (!!item) item.setDate(date);
	},
	setDriverRideTime: function(driver_id, hour, minutes) {
		const item = get_driver_item(driver_id);
		if (!!item) {
			item.getDate().setHours(hour);
			item.getDate().setMinutes(minutes);
		}
	},
	setDriverSeatCount: function(driver_id, count) {
		const item = get_driver_item(driver_id);
		if (!!item) item.setCount(count);
	},
	getDriversByDateAndRoute: function(date, route) {
		return _(driver_list)
			.chain()
			.filter((item) => item.getDate().getDate() == date.getDate()
				&& item.getDate().getMonth() == date.getMonth()
				&& item.getDate().getFullYear() == date.getFullYear()
				&& item.getRoute() == route
			)
			.forEach((v, k) => v.num = k + 1)
			.value();
	},
	setUserState: function(user_id, state) {
		const item = get_user_state_item(user_id);
		if (!item) {
			user_states.push(new User(user_id, null, null, state));
		} else {
			item.setState(state);
		}
	},
	getUserState: function(user_id, value) {
		return _(user_states)
			.chain()
			.find(item => item.isEqualID(user_id))
			.invoke('getState')
			.thru(_value => ({value: _value}))
			.get('value', value)
			.value()
	},
	getDriverInformationText: function(drivers, date) {
		var message_header_text = '';
		if (!_.size(drivers)) {
			if (utils.isEqualsDates(date, utils.getTodayDate())) {
				message_header_text = 'На сегодня водители отсутствуют\n';
			} else if (utils.isEqualsDates(date, utils.getTomorrowDate())) {
				message_header_text = 'На завтра водители отсутствуют\n';
			} else {
				message_header_text = 'На запрашиваемую дату водители отсутствуют.\n';
			}

			message_header_text += 'Вы можете ожидать появления новых водителей, либо сбросить поиск.\n' +
				'Если кто-то появится, мы Вас оповестим.';
		} else {
			if (utils.isEqualsDates(date, utils.getTodayDate())) {
				message_header_text = 'Водители на сегодня:\n';
			} else if (utils.isEqualsDates(date, utils.getTomorrowDate())) {
				message_header_text = 'Водители на завтра:\n';
			} else {
				message_header_text = 'Водители на запрашиваемую дату:\n';
			}
		}

		return message_header_text;
	}
}