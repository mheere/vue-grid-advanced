import Vuex from 'vuex';
import { GridStateInfo, VGridSettings, SelectRowInfo, UpdateRowInfo, FindRowInfo, CellStyleInfo } from './index';
import { VGridState } from './VGridState';
import { GridColumn } from './GridColumns';
import { EngineOptions, VueEngineResult } from './engine/engine_utils'
import * as VEngine from './engine/engine';
import * as R from 'ramda'
import * as _ from 'lodash';
import * as __core from './core';


// -------------------------------------------------
// define common functions away from the store 
// -------------------------------------------------

function getColumn(state: any, colName: string): GridColumn {
	return _.find(state.columns, (column: GridColumn) => column.dbName.isSame(colName));
}

function doRefresh(state: any) {
	state.isRefreshData = true;
	setTimeout(	() => state.isRefreshData = false, 0)
}

function internalCreateStateInfo(state: VGridState): GridStateInfo {

	let idColumn = state.settings.idColumn;

	// prepare the return info object
	let info = new GridStateInfo();
	info.gridKey = state.gridKey;
	//info.context = state.context;
	//info.contextSub = state.contextSub;
	// info.origin = state.origin;
	// info.lastAction = state.lastAction;
	info.dblClickedColumn = state.dblClickedColumn;
	info.column = state.columns.find(c => c.dbName == state.clickedColumn);
	info.selectedRow = state.selectedRow;
	info.selectedPKValue = state.selectedRow ? state.selectedRow.pkvalue : "";
	info.selectedIDValue = state.selectedRow ? state.selectedRow[idColumn] : "";
	info.idColumn = idColumn;
	info.columns = state.columns;	// .styles.find(style => style.isSelected).columns;    // we presume there is always a default style...
	info.totalRowCount = state.rowsPrepared.length;

	info.isGroupHeader = state.selectedRow ? state.selectedRow.__isGroupHeader : false;
	info.groupLevel = state.selectedRow ? state.selectedRow.__groupLevel : -1;

	// walk through the checked items 
	//info.checkedRows = this.getCheckedRows(false);      // don't clear them!

	// get the selectedRowIDs items 
	let selectedIDValues = state.selectedRowIDs;

	// if the currect selected row is not in the list then add it!
	if (state.selectedRowID.length > 0 && !_.includes(selectedIDValues, state.selectedRowID))
		selectedIDValues.push(state.selectedRowID);

	// map 
	info.selectedRows = _.map(selectedIDValues, id => _.find(state.rowsPrepared, row => row[idColumn] == id));

	return info;
}

export default function createStore(state: any) {

	// -------------------------------------------------------------------------
	// create the Vuex store passing in the above created state
	// -------------------------------------------------------------------------
	const vstore: any = new Vuex.Store({
		state: state,
		getters: {
			rowsPreparedCount: (state, getters) => {
				return state.rowsPreparedCount;
			},
			rowsTotalHeight: (state, getters) => {
				return state.rowsPreparedCount * state.rowHeight;
			},
			isSelectedRow: (state: any) => (index: number) => {
				//let idCol = state.settings.idColumn;		
				let idValue = state.rowsPrepared[index].pkvalue;
				return idValue == state.selectedRowID;
			},
			isInSelectedRange: (state: any) => (index: number) => {
				if (state.selectedRowIDs.length == 0) return false;
				//let idCol = state.settings.idColumn;
				let idValue = state.rowsPrepared[index].pkvalue;
				return state.selectedRowIDs.includes(idValue);
			},
			hasGroupingCols: (state: any) => {
				return state.groupingColumns.length > 0;
			},
			visibleRows: (state: any) => {
				return state.visibleRowCount;
			},
			isGroupingCol: (state: any) => (col: GridColumn) => {
				return state.groupingColumns.includes(col.dbName);
			},
			groupingColumns: (state) => {
				//let retColumns = state.columns.filter(c => c.visible).sort((a, b) => a.order - b.order);
				let retColumns = state.groupingColumns.map(c => state.columns.find(c2 => c2.dbName.isSame(c)));
				return retColumns.filter(c => c.visible);
			},
			nonGroupingColumns: (state) => {
				let retColumns = state.columns.filter(c => c.visible).sort((a, b) => a.order - b.order);
				return retColumns.filter(c => !state.groupingColumns.includes(c.dbName));
			},
			visibleColumns: (state, getters) => {
				// return the grouping columns first, then the non grouping cols
				return getters.groupingColumns.concat(getters.nonGroupingColumns).filter(c => !c.frozenLeft && !c.frozenRight);
			},
			hasFrozenColsLeft: (state: VGridState, getters) => {
				return getters.frozenColumnsLeft.length > 0;
			},
			hasFrozenColsRight: (state: VGridState, getters) => {
				return getters.frozenColumnsRight.length > 0;
			},
			frozenColumnsLeft: (state: VGridState) => {
				return state.columns.filter(c => c.frozenLeft);
			},
			frozenColumnsRight: (state: VGridState, getters) => {
				return state.columns.filter(c => c.frozenRight);
			},
			getGridStateInfoIdentifier: state => () => state.gridStateInfo,
		},
		actions: {
			increment (context) {
				context.commit('increment')
			},
			setData(context, rows: any) {

				let state = context.state;

				if (!Array.isArray(rows))
					throw new Error("Incoming rows expected to be an array!");
				
				// ----------------------------------------------
				// EVERY row NEEDS an own internal unique identifier.  I call this the pkvalue.  This is needed for instance when
				// grouping occurrs which will introduce sub-header rows that need a unique ID for easy reference.
				// So if the user has not identified a unique idColumn then we set the 'pkvalue' identifier to be the idColumn
				// ----------------------------------------------
				if (!state.settings.idColumn) state.settings.idColumn = "pkvalue";

				// ensure each row has a unique pkvalue property
				rows.forEach((row, i) => {
					if (!R.has('pkvalue', row))
						row.pkvalue = (i.toString()).padStart(12, "0");
				});

				// find the current selected row and try to reselect that row
				let idCol = state.settings.idColumn;
				let selRowInfo: SelectRowInfo = new SelectRowInfo();
				if (state.selectedRowID) {
					selRowInfo.findIDValue = state.selectedRowID;
					selRowInfo.findIDColumn = idCol;
				}
				
				// hand over the rows to the state
				state.rowsRaw = rows;

				// run the engine to prepare the correct visible state
				context.commit("runEngine");
				context.commit("moveSelectedRowIntoView");

				// make a sensible row selection
				context.commit("selectRow", selRowInfo);

			},
			setSortColumn(context, colName) {
				
				let state = context.state;
				
				// find the colName
				let match: GridColumn = getColumn(state, colName);

				// if we are already sorting then reverse the sort
				if (match.sortDirection.length > 0)
					match.reverseSort();
				else {
					// clear any existing sorting
					_.each(state.columns, (column: GridColumn) => column.sortDirection = "");
					// start sort in asc order
					match.sortDirection = "asc";
				}
				
				context.commit("runEngine");
				context.commit("moveSelectedRowIntoView");
			},
			setGroupColumns(context, cols: string[]) {
				
				let state = context.state;
				state.groupingColumns = cols;
				
				context.commit("runEngine");
				context.commit("moveSelectedRowIntoView");
			},
			addGroupColumn(context, dbName: string) {
				context.state.groupingColumns.push(dbName);
				context.commit("runEngine");
				context.commit("moveSelectedRowIntoView");
			},
			removeGroupColumn(context, dbName: string) {
				context.state.groupingColumns.remove(dbName);
				context.commit("runEngine");
				context.commit("moveSelectedRowIntoView");
			},
			reGroupColumn(context, info: any){
				//  { source: colSource, dest: colDest 
				let state = context.state;
				let posSource = state.groupingColumns.indexOf(info.source);
				let posDest = state.groupingColumns.indexOf(info.dest);

				state.groupingColumns.remove(info.source);
				state.groupingColumns.splice(posDest , 0, info.source);

				// // moving 'left'
				// if (posDest < posSource) {
				// 	state.groupingColumns.splice(posDest , 0, info.source);
				// }
				// else {	// moving 'right'
				// 	state.groupingColumns.splice(posDest , 0, info.source);
				// }
				
				context.commit("runEngine");
				context.commit("moveSelectedRowIntoView");
			},
			setExpandCollapse(context, rowNo: number) {
				
				// let rowNo: number = info.rowNo;
				// let action: string = info.action;

				let state = context.state;
				let row = state.rowsPrepared[rowNo];
				let groupKey = row.__groupKey;

				if (state.collapsedHeaders.includes(groupKey))
					state.collapsedHeaders.remove(groupKey);
				else
					state.collapsedHeaders.push(groupKey);
				
				context.commit("runEngine");
				context.commit("moveSelectedRowIntoView");
			},
			updateData(context, info: UpdateRowInfo) {

				let state = context.state;
				let index = -1;

				// if an updated row is given then first find that row in our set then update all fields
				if (info.updatedRow) {

					// find the correct row
					let idCol = state.settings.idColumn;

					// find the index of the row
					index = state.rowsPrepared.findIndex((row: any) => row[idCol] == info.updatedRow[idCol]);

					if (index > -1) {
						R.keys(info.updatedRow).forEach(key => {
							state.rowsPrepared[index][key] = info.updatedRow[key];
						})
					}
				}
				// if a new row was given then simply add this to the rawlist
				else if (info.newRow) {
					
					// if incoming row has no pkvalue then create one at random
					let i = __core.getRandomNumber(10000000000, 99999999999);
					if (!R.has('pkvalue', info.newRow))
						info.newRow.pkvalue = (i.toString()).padStart(12, "0");

					state.rowsRaw.push(info.newRow);
				}
				// caller wishes to update a single cell and hands over the find Column/Value and the update Column/Value
				else if (info.findIDValue) {
					// find the correct row
					let idCol = info.findIDColumn ? info.findIDColumn : state.settings.idColumn;
					index = state.rowsPrepared.findIndex((row: any) => row[idCol] == info.findIDValue);

					if (index > -1) 
						state.rowsPrepared[index][info.columnToUpdate] = info.columnNewValue;
				}

				if (!info.ignoreEngineUpdate)
					context.commit("runEngine");

			},
		},
		mutations: {
			moveSelectedRowIntoView(state) {
				if (!state.selectedRowID) return;

				// move the selected row into the Viewport
				let idCol = state.settings.idColumn;
				let rowNo = state.rowsPrepared.findIndex((row: any) => row[idCol] == state.selectedRowID);

				// basically make sure that rowNo is within 'startRow' and 'startRow' + 'visibleRowCount'...
				if (rowNo > state.startRow && rowNo < state.startRow + state.visibleRowCount)
					return;
				
				// we are 'outside' so bring us in...
				let newStartRow = rowNo - 2 < 1 ? 0 : rowNo - 2;

				// calculate the new ratio our scrollbar should be in
				state.setVertScrollRatio = newStartRow / state.rowsPreparedCount;

			},
			selectRow(state, info: SelectRowInfo) {

				// clear selections (unless modifier keys are involved)
				if (info.clearOtherSelections && !info.hasModifierKeys) {
					state.selectedRow = null;
					state.selectedRowID = "";
					state.selectedRowIDs.removeAll();
				}

				// 
				state.dblClickedColumn = info.dblClickedColumn;
				state.clickedColumn = info.ClickedColumn;

				// assume a row was given
				let row = info.row;
				let idCol = info.findIDColumn ? info.findIDColumn : state.settings.idColumn;

				// if a rowNo is given then a row was clicked in the grid... that is for sure
				if (info.rowNo >= 0)  {
					let index = info.rowNo;
					row = state.rowsPrepared[index];
				}

				// if a findIDValue is given the caller wishes us to find and select a row
				if (info.findIDValue) {
					row = state.rowsPrepared.findItem((row: any) => row[idCol] == info.findIDValue);
				}

				// if no row is still selected then check if we need to select the first row
				if (!row && info.selectFirstRowIfNoneSelected)
					row = state.rowsPrepared[0];

				if (row) {

					// get the 
					let idvalue = row.pkvalue;
					//let idvalue = getRowIDValue(state, row);

					if (info.hasModifierKeys) {

						if (info.ctrlKey) {
							if (state.selectedRowIDs.includes(idvalue))
								state.selectedRowIDs.remove(idvalue);
							else
								state.selectedRowIDs.push(idvalue);
						}

						if (info.shiftKey && state.selectedRowID) {

							// get the rowNo of the current selectedRowID
							let startRowNo = state.rowsPrepared.findIndex((row: any) => row.pkvalue == state.selectedRowID);
							let endRowNo = info.rowNo;		// 

							let range = _.range(startRowNo, endRowNo);

							range.push(endRowNo);			// lodash does not include the end so we do this by hand..

							range.forEach(r => {
								let idvalue = state.rowsPrepared[r].pkvalue;	
								if (!state.selectedRowIDs.includes(idvalue))
									state.selectedRowIDs.push(idvalue);
							});
							
						}

					}
					else {
						state.selectedRowID = idvalue;
						state.selectedRow = row;
					}
				}

				// Note, this will raise the onChanged event through the use of a watcher!
				state.gridStateInfo = internalCreateStateInfo(state);
			},
			calcRowsToDisplay(state, stuff) {

				if (!state.rowsPrepared) return;

				state.vertScrollDiff = stuff.diff;
				state.visibleHeight = stuff.visibleHeight;
				state.hasHorzScrollbar = stuff.hasHorzScrollbar;
				//if (stuff.rowHeight > 0) state.rowHeight = stuff.rowHeight;

				// if there are no rows prepared from the engine (there is no data to display), just step out
				if (state.rowsPreparedCount == 0) {
					state.startRow = 0;
					state.visibleRowCount = 0;
					return;
				}

				let rowsTotalHeight = state.rowsPreparedCount * state.rowHeight;
				let ratio = Math.abs(state.vertScrollDiff / rowsTotalHeight);
				state.startRow = Math.round(ratio * state.rowsPreparedCount);

				// calc how many rows we need to show
				state.visibleRowCount = Math.round(state.visibleHeight / state.rowHeight);	// + 1;

				// if there are fewer rows in total then can be shown then lower the visibleRowCount
				if (state.rowsPreparedCount < state.visibleRowCount)
					state.visibleRowCount = state.rowsPreparedCount;
				
			},
			runEngine(state) {

				// create the engine options
				let options: EngineOptions = new EngineOptions();
				options.cols = state.columns;
				options.groupingColumns = state.groupingColumns;
				options.collapsedHeaders = state.collapsedHeaders;
				options.colCurrLookUp = state.settings.currencyLookupColumn;

				// create and run the data engine
				let engine: VEngine.VueGridEngine = new VEngine.VueGridEngine();
				let ret = engine.processData(state.rowsRaw, options);

				// retrieve the engine's data
				state.totalsRow = ret.totalsRow;
				state.rowsPreparedCount = 0;
				state.rowsPrepared = [];
				state.rowsPrepared.push(...ret.rows);
				state.rowsPreparedCount = state.rowsPrepared.length;

				// now we have new row counts - do a refresh
				doRefresh(state);
			},
			refresh(state) {
				doRefresh(state);
			},
			setIsVertScrolling (state, isScrolling: boolean) {
				state.isVertScrolling = isScrolling;
			},
			resetRightSliders (state) {
				state.showGridSettings = false;
				state.showGridColumns = false;
			},
			resizeColumn(state, info: any) {
				let match: GridColumn = getColumn(state, info.colName);
				match.width = info.newCW;
			},
			setDragSourceColumnName(state, dbName: any) {
				state.dragSourceColumnName = dbName;
			},
			setDragTargetColumnName(state, dbName: any) {
				state.dragTargetColumnName = dbName;
			},
			setColumnIsBeingResized(state, isResizing: boolean) {
				state.isColumnResizing = isResizing;
			},
			setVertScrollRatio(state, ratio: number) {
				state.setVertScrollRatio = ratio;
			},
			updateShowGrouperBar(state, newValue) {
				state.showGrouperBar = newValue;
			},
			resortColumn(state) {

				// ------------------
				let source = state.dragSourceColumnName;
				let dest = state.dragTargetColumnName;

				if (!source || !dest) return;

				let mycols: GridColumn[]  = this.getters.visibleColumns;
				let posSource = mycols.findIndex(c => c.dbName.isSame(source));
				let posDest = mycols.findIndex(c => c.dbName.isSame(dest));

				// if we are moving 'right' then adjust the dest column to its right next one!
				if (posDest > posSource) {
					if (posDest + 1 < mycols.length)
						dest = mycols[posDest + 1].dbName;
					else {
						// TODO - we wish to move the source to the very most right hand... 
						// not possible right now :(   TODO TODO
					}
				}
				
				// ------------------
				let colOri: GridColumn = getColumn(state, source);
				let colDest: GridColumn = getColumn(state, dest);

				// if columns is dragged left
				if (posDest < posSource) {
					state.columns
						.filter(c => c.order >= colDest.order && c.order < colOri.order)
						.forEach(c => c.order++);
					colOri.order = colDest.order - 1;
				}
				else {
					state.columns
						.filter(c => c.order > colOri.order && c.order < colDest.order)
						.forEach(c => c.order--);
					colOri.order = colDest.order - 1;
				}
				
				// resort all columns
				state.columns.sort((a, b) => a.order - b.order).forEach((c, index) => c.order = index);

			},
			setLastRefresh(state, txt) {
				state.pageLastRefresh = txt;
			},
			toggleGridColumns(state) {
				state.showGridSettings = false;
				state.showGridColumns = !state.showGridColumns;
			},
			toggleGridSettings(state) {
				state.showGridColumns = false;
				state.showGridSettings = !state.showGridSettings;
			},
			
		}
	});

	return vstore;
}