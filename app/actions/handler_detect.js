const _ = require('lodash');
const {
	addDriver, addUser, setUserRoute, setDriverRoute,
	setUserRideDate, setDriverRideDate, getUserByID,
	getDriversByDateAndRoute, removeUser, removeDriver,
	setDriverRideTime, setDriverSeatCount,
	setUserState, getUserState, getDriverInformationText
} = require('../core');
const {
	FROM_UFA_TO_CHECKMAGUSH, FROM_CHECKMAGUSH_TO_UFA,
	PASSENGER, DRIVER, TODAY, TOMORROW, OTHER, SET_OTHER,
	STATE_UNDEFINED, STATE_SET_TIME
} = require('../constants');
const { 
	getTodayDate, getTomorrowDate, normalizeDate, isEqualsDates 
} = require('../utils');
const { 
	getAvailableDriverListAsString,
	getAvailableDriverListAsButtons
} = require('./common');
const { sendMessage, getUser } = require('../vk_api');
const ButtonsFactory = require('../vk_api/buttons_factory');

module.exports = async function({ command, data }) {
	switch (command) {
		case 'start':
			return function(msg, client_info) {
				removeUser(msg['from_id']);
				removeDriver(msg['from_id']);
				const btnFactory = new ButtonsFactory();
				btnFactory.addButtonsInRow([
					ButtonsFactory.getTextButton('Я водитель', {command: 'add_driver'}, 'primary'),
					ButtonsFactory.getTextButton('Я пассажир', {command: 'add_passenger'}, 'primary'),
				], 1);
				sendMessage(msg['from_id'], 'Выберите категорию', btnFactory.value());
			};
		case 'add_driver':
			return async function(msg, client_info) {
				const { response } = await getUser(msg['from_id']);
				const { first_name, last_name } = response[0];
				addDriver(msg['from_id'], first_name, last_name);

				const btnFactory = new ButtonsFactory();
				btnFactory.addButtonsInRow([
					ButtonsFactory.getTextButton('Уфа-Чекмагуш', {
						command: 'set_route',
						data: {route: FROM_UFA_TO_CHECKMAGUSH, user_type: DRIVER}
					}, 'primary'),
					ButtonsFactory.getTextButton('Чекмагуш-Уфа', {
						command: "set_route",
						data: {route: FROM_CHECKMAGUSH_TO_UFA, user_type: DRIVER}
					}, 'primary'),
				], 1);

				sendMessage(msg['from_id'], 'Выберите маршрут', btnFactory.value());
			};
		case 'add_passenger':
			return async function(msg, client_info) {
				const { response } = await getUser(msg['from_id']);
				const { first_name, last_name } = response[0];
				addUser(msg['from_id'], first_name, last_name);

				const btnFactory = new ButtonsFactory();
				btnFactory.addButtonsInRow([
					ButtonsFactory.getTextButton('Уфа-Чекмагуш', {
						command: 'set_route',
						data: {route: FROM_UFA_TO_CHECKMAGUSH, user_type: PASSENGER}
					}, 'primary'),
					ButtonsFactory.getTextButton('Чекмагуш-Уфа', {
						command: "set_route",
						data: {route: FROM_CHECKMAGUSH_TO_UFA, user_type: PASSENGER}
					}, 'primary'),
				], 1);

				sendMessage(msg['from_id'], 'Выберите маршрут', btnFactory.value());
			};
		case 'set_route':
			return function(msg, client_info) {
				const { route, user_type } = data;
				const btnFactory = new ButtonsFactory();
				switch (user_type) {
					case PASSENGER:
						setUserRoute(msg['from_id'], route);
						btnFactory.addButtonsInRow([
							ButtonsFactory.getTextButton('Сегодня', {command: 'set_day', data: {day: TODAY, user_type: PASSENGER}}, 'primary'),
							ButtonsFactory.getTextButton('Завтра', {command: 'set_day', data: {day: TOMORROW, user_type: PASSENGER}}, 'primary'),
							ButtonsFactory.getTextButton('Другой день', {command: 'set_day', data: {day: OTHER, user_type: PASSENGER}}, 'primary'),
						], 1);
						btnFactory.setOneTime(true);
						sendMessage(msg['from_id'], 'Выберите день поездки', btnFactory.value());
						break;
					case DRIVER:
						setDriverRoute(msg['from_id'], route);
						btnFactory.addButtonsInRow([
							ButtonsFactory.getTextButton('Сегодня', {command: 'set_day', data: {day: TODAY, user_type: DRIVER}}, 'primary'),
							ButtonsFactory.getTextButton('Завтра', {command: 'set_day', data: {day: TOMORROW, user_type: DRIVER}}, 'primary'),
							ButtonsFactory.getTextButton('Другой день', {command: 'set_day', data: {day: OTHER, user_type: DRIVER}}, 'primary'),
						], 1);
						sendMessage(msg['from_id'], 'Выберите день поездки', btnFactory.value());
						break;
				}
			};
		case 'set_day':
			return function(msg, client_info) {
				const { day, user_type } = data;
				const btnFactory = new ButtonsFactory();
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
						}, {payload: JSON.stringify({command: 'set_day', data: {day: SET_OTHER, user_type}})})
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
						const drivers = getDriversByDateAndRoute(date, user.getRoute());
						var msg_text = getDriverInformationText(drivers, date);

						if (!_.size(drivers)) {
							btnFactory.addButtonsInRow([
								ButtonsFactory.getTextButton('Ожидать водителей', {command: 'wait_driver'}, 'primary'),
								ButtonsFactory.getTextButton('Сбросить', {command: 'start'}, 'primary'),
							],1);
						} else {
							msg_text += getAvailableDriverListAsString(drivers, 0);
							getAvailableDriverListAsButtons(btnFactory, drivers, 0);
							btnFactory.setInline(true);
						}

						sendMessage(msg['from_id'], msg_text, btnFactory.value());
						break;
					case DRIVER:
						setDriverRideDate(msg['from_id'], date);
						setUserState(msg['from_id'], STATE_SET_TIME);
						sendMessage(msg['from_id'], 'Укажите время в формате ЧЧ:ММ', btnFactory.value());
						break;
				}
			};
		case 'set_number_seats':
			return function(msg, client_info) {
				const { count } = data;
				const btnFactory = new ButtonsFactory();
				setDriverSeatCount(msg['from_id'], count);
				btnFactory.addButtonsInRow([
					ButtonsFactory.getTextButton('Сбросить', {command: 'start'}, 'primary')
				], 1)
				sendMessage(msg['from_id'], 'Ожидайте пассажиров', btnFactory.value());
			}
		case 'wait_driver':
			return function(msg, client_info) {

			};
		default:
			return function(msg, client_info) {
				switch (getUserState(msg['from_id'], STATE_UNDEFINED)) {
					case STATE_SET_TIME:
						const msg_text = msg['text'];
						const re = /^[0-2]\d{1}:[0-5]\d{1}$/;
						const btnFactory = new ButtonsFactory();
						if (re.test(msg_text)) {
							const [hour, minutes] = msg_text.split(':');
							setDriverRideTime(msg['from_id'], hour, minutes);
							btnFactory.addButtonsInRow([
								ButtonsFactory.getTextButton('1', {command: 'set_number_seats', data: {count: 1}}, 'primary'),
								ButtonsFactory.getTextButton('2', {command: 'set_number_seats', data: {count: 2}}, 'primary'),
							], 1);
							btnFactory.addButtonsInRow([
								ButtonsFactory.getTextButton('3', {command: 'set_number_seats', data: {count: 3}}, 'primary'),
								ButtonsFactory.getTextButton('4', {command: 'set_number_seats', data: {count: 4}}, 'primary'),
							], 2);
							btnFactory.addButtonsInRow([
								ButtonsFactory.getTextButton('5', {command: 'set_number_seats', data: {count: 5}}, 'primary'),
								ButtonsFactory.getTextButton('6', {command: 'set_number_seats', data: {count: 6}}, 'primary'),
							], 3);
							sendMessage(msg['from_id'], 'Укажите количество мест', btnFactory.value());
							setUserState(msg['from_id'], STATE_UNDEFINED);
						} else {
							sendMessage(msg['from_id'], 'Некорректное значение, повторите снова');
						}
						break;
					case STATE_UNDEFINED:
						break;
				}
			};
	}
}