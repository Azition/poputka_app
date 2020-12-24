const _ = require('lodash');
const {
	addDriver, addUser,
	setUserRoute, setDriverRoute,
	setUserRideDate, setDriverRideDate,
	getUserByID,
	getDriversByDateAndRoute
} = require('../core');
const {
	FROM_UFA_TO_CHECKMAGUSH, FROM_CHECKMAGUSH_TO_UFA,
	PASSENGER, DRIVER,
	TODAY, TOMORROW, OTHER, SET_OTHER
} = require('../constants');
const { 
	getTodayDate, getTomorrowDate, 
	normalizeDate, isEqualsDates 
} = require('../utils');
const { sendMessage, getUser } = require('../vk_api');

const DRIVERS_COUNT = 3;

module.exports = async function({ command, data }) {
	switch (command) {
		case 'start':
			return function(msg, client_info) {
				sendMessage(msg['from_id'], 'Выберите категорию', {
					one_time: false,
					buttons: [
						[
							{
								action: {
									type: 'text',
									label: 'Я водитель',
									payload: JSON.stringify({
										command: "add_driver"
									})
								},
								color: 'primary'
							},
							{
								action: {
									type: 'text',
									label: 'Я пассажир',
									payload: JSON.stringify({
										command: "add_passenger"
									})
								},
								color: 'primary'
							}
						]
					],
					inline: false
				})
			};
		case 'add_driver':
			return function(msg, client_info) {
				const response = getUser(msg['from_id']);
				const { first_name, last_name } = response;
				addDriver(msg['from_id'], first_name, last_name);
				sendMessage(msg['from_id'], 'Выберите маршрут', {
					one_time: false,
					buttons: [
						[
							{
								action: {
									type: 'text',
									label: 'Уфа-Чекмагуш',
									payload: JSON.stringify({
										command: "set_route",
										data: {
											route: FROM_UFA_TO_CHECKMAGUSH,
											user_type: DRIVER
										}
									})
								},
								color: 'primary'
							}
						],
						[
							{
								action: {
									type: 'text',
									label: 'Чекмагуш-Уфа',
									payload: JSON.stringify({
										command: "set_route",
										data: {
											route: FROM_CHECKMAGUSH_TO_UFA,
											user_type: DRIVER
										}
									})
								},
								color: 'primary'
							}
						]
					],
					inline: false
				});
			}
		case 'add_passenger':
			return function(msg, client_info) {
				const response = getUser(msg['from_id']);
				const { first_name, last_name } = response;
				addUser(msg['from_id'], first_name, last_name);
				sendMessage(msg['from_id'], 'Выберите маршрут', {
					one_time: false,
					buttons: [
						[
							{
								action: {
									type: 'text',
									label: 'Уфа-Чекмагуш',
									payload: JSON.stringify({
										command: "set_route",
										data: {
											route: FROM_UFA_TO_CHECKMAGUSH,
											user_type: PASSENGER
										}
									})
								},
								color: 'primary'
							}
						],
						[
							{
								action: {
									type: 'text',
									label: 'Чекмагуш-Уфа',
									payload: JSON.stringify({
										command: "set_route",
										data: {
											route: FROM_CHECKMAGUSH_TO_UFA,
											user_type: PASSENGER
										}
									})
								},
								color: 'primary'
							}
						]
					],
					inline: false
				});
			}
		case 'set_route':
			return function(msg, client_info) {
				const { route, user_type } = data;
				switch (user_type) {
					case PASSENGER:
						setUserRoute(msg['from_id'], route);
						sendMessage(msg['from_id'], 'Выберите день поездки', {
							one_time: false,
							buttons: [
								[
									{
										action: {
											type: 'text',
											label: 'Сегодня',
											payload: JSON.stringify({
												command: 'set_day',
												data: {
													day: TODAY,
													user_type: PASSENGER
												}
											})
										},
										color: 'primary'
									},
									{
										action: {
											type: 'text',
											label: 'Завтра',
											payload: JSON.stringify({
												command: 'set_day',
												data: {
													day: TOMORROW,
													user_type: PASSENGER
												}
											})
										},
										color: 'primary'
									},
									{
										action: {
											type: 'text',
											label: 'Другой день',
											payload: JSON.stringify({
												command: 'set_day',
												data: {
													day: OTHER,
													user_type: PASSENGER
												}
											})
										},
										color: 'primary'
									}
								]
							],
							inline: false
						});
						break;
					case DRIVER:
						setDriverRoute(msg['from_id'], route);
						sendMessage(msg['from_id'], 'Выберите день поездки', {
							one_time: false,
							buttons: [
								[
									{
										action: {
											type: 'text',
											label: 'Сегодня',
											payload: JSON.stringify({
												command: 'set_day',
												data: {
													day: TODAY,
													user_type: DRIVER
												}
											})
										},
										color: 'primary'
									},
									{
										action: {
											type: 'text',
											label: 'Завтра',
											payload: JSON.stringify({
												command: 'set_day',
												data: {
													day: TOMORROW,
													user_type: DRIVER
												}
											})
										},
										color: 'primary'
									},
									{
										action: {
											type: 'text',
											label: 'Другой день',
											payload: JSON.stringify({
												command: 'set_day',
												data: {
													day: OTHER,
													user_type: DRIVER
												}
											})
										},
										color: 'primary'
									}
								]
							],
							inline: false
						});
						break;
				}
			}
		case 'set_day':
			return function(msg, client_info) {
				const { day, user_type } = data;
				var date = null;
				switch (day) {
					case TODAY:
						date = getTodayDate();
						break;
					case TOMORROW:
						date = getTomorrowDate();
						break;
					case OTHER:
						sendMessage(msg['from_id'], 'Укажите дату в формате ДД:ММ', {
							one_time: false,
							buttons: []
						}, {
							payload: JSON.stringify({
								command: 'set_day',
								data: {
									day: SET_OTHER,
									user_type
								}
							})
						})
						break;
					case SET_OTHER:
						const { text } = msg;
						date = normalizeDate(text);
				}

				if (!date) return;

				switch (user_type) {
					case PASSENGER:
						setUserRideDate(msg['from_id'], date);
						const user = getUserByID(msg['from_id']);
						const drivers = getDriversByDateAndRoute(date, user.route);
						var msg_text = '';
						var buttons = [];

						if (!_.size(drivers)) {
							if (isEqualsDates(date, getTodayDate())) {
								msg_text = 'На сегодня водители отсутствуют';
							} else if (isEqualsDates(date, getTomorrowDate())) {
								msg_text = 'На завтра водители отсутствуют';
							} else {
								msg_text = 'На запрашиваемую дату водители отсутствуют';
							}
						} else {
							if (isEqualsDates(date, getTodayDate())) {
								msg_text = 'Водители на сегодня:\n';
							} else if (isEqualsDates(date, getTomorrowDate())) {
								msg_text = 'Водители на завтра:\n';
							} else {
								msg_text = 'Водители на запрашиваемую дату:\n';
							}

							const result_str = _(drivers)
								.chain()
								.chunk(DRIVERS_COUNT)
								.thru(list => list[0])
								.map(driver => [
									`${driver.last_name} ${driver.first_name}`,
									`Отправляется в ${driver.date.getHours()}:${driver.date.getMinutes()}`,
									''
								])
								.flatten()
								.join('\n')
								.value();

							msg_text += result_str;
						}


						sendMessage(msg['from_id'], msg_text, {
							one_time: false,
							buttons,
							inline: false
						})
						break;
					case DRIVER:
						setDriverRideDate(msg['from_id'], date);
						break;
				}
			}
		default:
			return function() {}
	}
}