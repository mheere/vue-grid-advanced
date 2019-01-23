
// import { VGrid, VGridSettings, CellStyleInfo, GridStateInfo, GridColumn, UpdateRowInfo } from './index';
// import { TempData } from './initTempData';

// let grid: VGrid = undefined;
// let _col_settings: string = "";			// remember the grid UI state

// let setData = (count: number = 5000) => {
// 	console.log('setData - init');
//   	let data = TempData.getData(count);
//  	grid.setData(data);
// }

// let createGrid = () => {

// 	let settings: VGridSettings = new VGridSettings();

// 	settings.el = ".test-grid-1";							// either a class/id identifier or the actual html element
// 	settings.friendlyName = "My test grid";					// a friendly name, handy if you have a collection of grids you want to hold on to
	
// 	settings.columns = TempData.getColumns();
// 	settings.idColumn = "code";

// 	settings.currencyLookupColumn = "currency";				// specify the currency lookup column (this specifies the code of the currency for that row)
// 	settings.currencyColumns = ["price", "valuation"];		// treat these columns to be formatted using the curr lookup column

// 	settings.settings = _col_settings;						// in case you wish to re-initialise the grid with the changes the user made previously

// 	// specify other props
// 	settings.showLastRefreshTime = true;
// 	settings.requestFreshData = () => {
// 		// wait for a little while then provide 1000 new rows
// 		setTimeout(() => {
// 			setData(1000);  
// 		}, 700);
// 		return true;		// return false if retrieving of data failed!
// 	}
	
// 	// when the grid is fully constructed (and the creation call is completed)
// 	settings.createdGridStructure = (g) => {
// 		let tempData = TempData.getData(500);
// 		g.setData(tempData);
// 	};

// 	// allow for some custom styling...
// 	settings.cellStyling = (style: CellStyleInfo) => {

// 		//style = doCurrencies(style);

// 		if (style.isTotalRow) return style;

// 		return cellStyling(style);

// 	}

// 	let cellStyling = (style: CellStyleInfo) => {

// 		let row: any = style.row;
// 		let col: GridColumn = style.col;

// 		if (!style.isGroupRow) {
// 			if (col.dbName == "lastname" && row["price"] < 300) {
// 				style.backgroundColor = "#e47575";
// 				style.color = "white";
// 			}
			
// 			if (col.dbName == "firstname" && row["price"] > 230 && row["price"] < 400) {
// 				style.backgroundColor = "rgb(97, 181, 61)";
// 				style.color = "white";
// 			}
// 		}

// 		if (col.dbName == "updown")  style.faImage = row["updown"];
// 		if (col.dbName == "updown2")  style.faImage = row["updown2"];
// 		if (col.dbName == "updown3")  style.faImage = row["updown3"];
// 		if (col.dbName == "updown4")  style.faImage = row["updown4"];


// 		// if the column should be interpreted as an image then make sure there is no text displayed
// 		if (col.isImage && !style.isTotalRow) style.textDisplay = "";

// 		// place an image in front of text if surname is 'de Boer'
// 		if (col.dbName.isSame("lastname") && style.textRaw == "de Boer") {
// 			style.faImage = "flag";
// 		}
// 		if (col.dbName.isSame("price") && Number(style.textRaw) > 600 ) {
// 			style.faImage = "flag";
// 			if (Number(style.textRaw) > 800)
// 				style.faImageColour = "red";
// 		}

// 		// change the actual text (Tom -> Tomsa)
// 		if (col.dbName.isSame("firstname") && style.textDisplay == "Tom") {
// 			style.textDisplay = "Tomsa";
// 		}

// 		// return the adjusted cell/style
// 		return style;
// 	}

// 	// create a new VGrid (given the settings)
// 	grid = new VGrid(settings);

// 	grid.onChanged = (info: GridStateInfo) => {
// 		let msg = `idColumn: ${info.idColumn},  selectedIDValue: ${info.selectedIDValue}, selectedPKValue: ${info.selectedPKValue} - # selected rows: ${info.selectedRows.length} - 
// 					 isgroupHeader: ${info.isGroupHeader}, groupLevel: ${info.groupLevel}, dblClick: ${info.dblClickColumn} `;
// 		console.log("onChanged: " + msg);
// 	};
// }

// // create a new VGrid (given the settings)
// // // grid = new VGrid(settings);

// let xx = (s, f) => {
// 	document.getElementById(s).addEventListener("click", () => f());	
// }

// xx('btn5', () => setData(5));
// xx('btn30', () => setData(30));
// xx('btn8000', () => setData(8000));
// xx('btnSelectCode5', () => grid.findAndSelect('Code5', 'code'));
// xx('btnCreateGrid', () => createGrid());
// xx('btnClearRows', () => setData(0));
// xx('btnDestroyGrid', () => grid.destroy());
// xx('btnGetSettings', () => _col_settings = grid.getSettings());
// xx('btnGroup1', () => grid.setGroupColumns(['currency']));
// xx('btnGroup2', () => grid.setGroupColumns(['currency', 'county']));
// xx('btnUnGroup10', () => grid.setGroupColumns([]));
// xx('btnRefresh', () => grid.refresh());


// xx('btnUpdateCell', () => {
// 	let info = UpdateRowInfo.updateSingleCell("Code8", "county", "Essex");
// 	grid.updateData(info);
// });

// xx('btnUpdateRow', () => {
// 	let row = grid.getCurrentRow();
// 	row.valuation = 9010.55;
// 	row.county = "London";
// 	row.price = 915.25;

// 	let info = UpdateRowInfo.updateRow(row);
// 	grid.updateData(info);
// });


// // $('#btnUpdateRowsLikeXMas').click(() => {
// // 	let x = 0;
// // 	let store = grid.getStore();
// // 	let rows = store.state.rowsPrepared;

// // 	let myIntervalID: any = setInterval(() => {

// // 		if (x++ > 1200)
// // 			window.clearInterval(myIntervalID);

// // 			let firstNames = ["Marcel", "Deniz", "Sam", "Tom"];
// // 			let lastNames = ["Heeremans", "de Wit", "van Dam", "Bakker", "van Oostenbroek", "de Boer"];
// // 			let counties = ["Kent", "Surrey", "Devon", "Cornwall"];
// // 			let currencies = ["USD", "GBP", "EUR", "AUD"];
// // 			let arrImages = ["coffee", "random", "flag", "o-square", "o-plus-square", "circle", "o-circle"];
// // 			let randomEntry = (arr: string[]): string => {
// // 				let randomnumber = Math.floor(Math.random() * arr.length);
// // 				return arr[randomnumber];
// // 			}

// // 		let rowid = __core.getRandomNumber(50);
// // 		let row = rows[rowid];

// // 		row.county = randomEntry(counties);
// // 		row.price = __core.getRandomNumber(1000);
// // 		row.firstname = randomEntry(firstNames);
// // 		row.lastname = randomEntry(lastNames);
// // 		row.valuation = __core.getRandomNumber(10000);
// // 		row.currency = randomEntry(currencies);
// // 		row.updown = randomEntry(arrImages);
// // 		row.checkbox = __core.getRandomNumber(5);
// // 		row.no_of_children = __core.getRandomNumber(10);

// // 		// now update that row
// // 		let info = UpdateRowInfo.createFromRow(row);
// // 		info.ignoreEngineUpdate = true;
// // 		grid.updateData(info);

// // 	}, 0);
// // });

// // start with creating the grid right now
// createGrid();
