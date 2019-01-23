


// create our store
const vstore = new Vuex.Store({
	state: {
		columns: [],
		rowsPreparedCount: 100
	},
	getters: {
		rowsTotalHeight: (state, getters) => {
			return state.rowsPreparedCount * 24;
		},
	},
	actions: {
		newDataAction(context, newRowCount = 5000) {
			// do stuff
			context.commit("runEngine");
		}
	},
	mutations: {
		removeColumn(state, colName) {
			
			// find the colName
			let column = getColumn(state, colName);
			
			state.columns.remove(column);	// uses extension
			
		},
		resizeColumn(state, info) {
			
			let colName = info.colName;
			let newWidth = info.width;

			// find the colName
			let column = getColumn(state, colName);

			column.width = newWidth;

		}
	},
	helpers: {
		getColumn(state, colName) {

			// ------------
			// 'complicated' fictitious code to find the right column from the state ....
			// ------------
			let column = state.columns.xxxxxxx;

			return column;	// returns the column

		}
	}
});


class VuexHelper {

	static getColumn(state, colName) {

		// ------------
			// 'complicated' fictitious code to find the right column from the state ....
			// ------------
			let column = state.columns.xxxxxxx;

			return column;	// returns the column

	}

}