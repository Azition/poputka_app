const getDate = function() {
	const date = new Date();
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
}

module.exports = {
	getTodayDate: function() {
		return getDate();
	},

	getTomorrowDate: function() {
		const date = getDate();
		date.setDate(date.getDate() + 1);
		return date;
	},

	normalizeDate: function(raw_date) {
		const [day_str, month_str] = raw_date.split(':')
		const day = parseInt(day_str);
		const month = parseInt(month_str);
		const date = getDate();
		date.setDate(day);
		date.setMonth(month);
		return date;
	},

	isEqualsDates: function(date_1, date_2) {
		return date_1.getDate() == date_2.getDate() 
			&& date_1.getMonth() == date_2.getMonth()
			&& date_1.getFullYear() == date_2.getFullYear();
	}
}