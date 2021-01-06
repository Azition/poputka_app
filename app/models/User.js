const User = function(id, first_name, last_name, state) {
	var _id = id,
		_first_name = first_name,
		_last_name = last_name,
		_route = null,
		_date = null,
		_count = null,
		_state = state || null;

	return {
		getID: () => _id,
		setID: (id) => _id = id,
		getFullName: () => [_first_name, _last_name].join(' ').trim(),
		getFirstName: () => _first_name,
		setFirstName: (name) => _first_name = name,
		getLastName: () => _last_name,
		setLastName: (name) => _last_name = name,
		getRoute: () => _route,
		setRoute: (route) => _route = route,
		getDate: () => _date,
		setDate: (date) => _date = date,
		getCount: () => _count,
		setCount: (count) => _count = count,
		getState: () => _state,
		setState: (state) => _state = state,
		isEqualID: (id) => id == _id,
	}
}

module.exports = User