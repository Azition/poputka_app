const _ = require('lodash');

var driver_list = [];
var user_list = [];
var user_states = [];

const get_user_item = (user_id) => _.find(user_list, (item) => item['user_id'] == user_id);
const get_driver_item = (user_id) => _.find(driver_list, (item) => item['user_id'] == user_id);
const get_user_state_item = (user_id) => _.find(user_states, (item) => item['user_id'] == user_id);

module.exports = {
	addUser: function(user_id, first_name, last_name) {
		const item = get_user_item(user_id);
		if (!item) user_list.push({ 
			user_id,
			first_name,
			last_name,
			route: null,
			date: null
		});
	},
	removeUser: function(user_id) {
		_.remove(user_list, (item) => item['user_id'] == user_id);
	},
	addDriver: function(driver_id, first_name, last_name) {
		const item = get_driver_item(driver_id);
		if (!item) driver_list.push({ 
			user_id: driver_id,
			first_name,
			last_name,
			route: null,
			date: null
		})
	},
	removeDriver: function(driver_id) {
		_.remove(driver_list, (item) => item['user_id'] == driver_id);
	},
	getUserByID: (uid) => get_user_item(uid),
	getDriverByID: (uid) => get_driver_item(uid),
	setUserRoute: function(user_id, route) {
		const item = get_user_item(user_id);
		if (!!item) item['route'] = route;
	},
	setDriverRoute: function(driver_id, route) {
		const item = get_driver_item(driver_id);
		if (!!item) item['route'] = route;
	},
	setUserRideDate: function(user_id, date) {
		const item = get_user_item(user_id);
		if (!!item) item['date'] = date;
	},
	setDriverRideDate: function(driver_id, date) {
		const item = get_driver_item(driver_id);
		if (!!item) item['date'] = date;
	},
	setDriverRideTime: function(driver_id, hour, minutes) {
		const item = get_driver_item(driver_id);
		if (!!item) {
			item['date'].setHours(hour);
			item['date'].setMinutes(minutes);
		}
	},
	setDriverSeatCount: function(driver_id, count) {
		const item = get_driver_item(driver_id);
		if (!!item) item['count'] = count;
	},
	getDriversByDateAndRoute: function(date, route) {
		return _.filter(driver_list, (item) => item['date'].getDate() == date.getDate()
			&& item['date'].getMonth() == date.getMonth()
			&& item['date'].getFullYear() == date.getFullYear()
			&& item['route'] == route
		);
	},
	setUserState: function(user_id, state) {
		const item = get_user_state_item(user_id);
		if (!item) {
			user_states.push({
				user_id,
				state
			});
		} else {
			item['state'] = state;
		}
	},
	getUserState: function(user_id, value) {
		return _(user_states)
			.chain()
			.find(['user_id', user_id])
			.get('state', value)
			.value()
	}
}