const _ = require('lodash');
const ButtonsFactory = require('../vk_api/buttons_factory');

const DRIVERS_COUNT = 3;

module.exports = {
	getAvailableDriverListAsString: function(driver_list, page) {
		let _page = parseInt(page);
		return _(driver_list)
			.chain()
			.chunk(DRIVERS_COUNT)
			.thru(list => list[_page])
			.map(driver => [
				`${driver.num} ${driver.getFullName()}`,
				`Отправляется в ${driver.getDate().toLocaleString('ru-RU', {hour: 'numeric', minute: 'numeric'})}`,
				''
			])
			.flatten()
			.join('\n')
			.value();
	},
	getAvailableDriverListAsButtons: function(btnFactory, driver_list, page) {
		let _page = parseInt(page);
		_(driver_list)
			.chain()
			.chunk(DRIVERS_COUNT)
			.thru(list => list[_page])
			.forEach((driver, index) => {
				btnFactory.addButtonsInRow([
					ButtonsFactory.getCallbackButton(`${driver.num} водитель`, {
						command: 'booking_driver',
						data: {
							driver_id: driver.getID()
						}
					}, 'primary')
				], index)
			})
			.commit();

		if (_.size(driver_list) <= DRIVERS_COUNT) return;

		if (_page > 0) {
			btnFactory.addButtonInRow(
				ButtonsFactory.getCallbackButton("<", {
					command: 'prev_page', data: { page_num: _page - 1 }
				}, 'primary'),
				DRIVERS_COUNT
			);
		}

		if (_.size(driver_list) > DRIVERS_COUNT * _page) {
			btnFactory.addButtonInRow(
				ButtonsFactory.getCallbackButton(">", {
					command: 'next_page', data: { page_num: _page + 1 }
				}, 'primary'),
				DRIVERS_COUNT
			);			
		}
	}
}