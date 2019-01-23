
import { VGrid, VGridSettings, CellStyleInfo, GridStateInfo, GridColumn, UpdateRowInfo } from './index';
import { getColumns, createData } from './TempData';

// -----------------------------------------------------------------------
// Lets create the grid
// -----------------------------------------------------------------------

// we ALWAYS start with defining the Grid Settings object
let settings = new VGridSettings();

settings.el = ".test-grid-1";	// either a class/id identifier or the actual html element

// specify which columns to use
settings.columns = getColumns();

// spcify the column the grid can interpret to be the 'primary key' - this is returned
// each time a selection(s) is made
// if left blank the inner unique 'pkvalue' is returned as id value
settings.idColumn = "code";

// specify the currency lookup column (this specifies the code of the currency for that row)
settings.currencyLookupColumn = "currency";	

// treat these columns to be formatted using the currencyLookupColumn
settings.currencyColumns = ["price", "valuation"];

// if we are going to deal with currencies we have to provide a lookup of their codes to use...
settings.setCurrencySymbol("GBP", "£");
settings.setCurrencySymbol("USD", "$");
settings.setCurrencySymbol("EUR", "€");
settings.setCurrencySymbol("AUD", "A$");
settings.setCurrencySymbol("CAD", "C$");

// specify other props
settings.showLastRefreshTime = true;
settings.requestFreshData = (grid) => {
    // wait for a little while then provide 1000 new rows
    setTimeout(() => {
        let tempData = createData(1000);
        grid.setData(tempData);
    }, 700);
    return true;		// return false if data retrieval failed
}

// when the grid is fully constructed the given function is called back
settings.createdGridStructure = (grid) => {
    let tempData = createData(500);
    grid.setData(tempData);
};

settings.cellStyling = (style: CellStyleInfo) => {

    let row: any = style.row;
    let col: GridColumn = style.col;

    if (style.isTotalRow) return style;

    // highlight people aged between 20 and 40
    if (col.dbName == "firstname" && !style.isGroupRow) {

        if (row["age"] >= 20 && row["age"] <= 40) {
            style.backgroundColor = "rgb(97, 181, 61)";
            style.color = "white";
        }
        
        // change some actual text (Tom -> Tomsa)
        if (style.textDisplay == "Tom")
            style.textDisplay = "Tomsa";
    }

    // flag all person over the age of 70 
    if (col.dbName == "lastname" && row["age"] > 70 ) {
        style.faImage = "flag";
        if (row["age"] > 85)
            style.faImageColour = "red";
    }

    // if the column is the updown then interpret the data as the font-awesome image!
    if (col.dbName == "img")  
        style.faImage = row["img"];

    // on the valuation cell I wish an indicator (up/down image)
    if (col.dbName == "valuation")  {
        let img = row["updown"] || "";  // bear in mind (sub)total rows will be undefined otherwise...
        style.faImage = img;
        style.faImageColour = img.contains("up") ? "green" : "red";
    }
    
    // return the adjusted cell-style
    return style;
}

// create a new VGrid (based on the settings)
let vgrid = new VGrid(settings);

// attach a handler so we get informed when the user interacts with the grid
vgrid.onChanged = (info) => {
    console.log(`selectedIDValue: ${info.selectedIDValue}`);
};

// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------

let setData = (count: number = 5000) => {
	console.log('setData - init');
  	let data = createData(count);
    vgrid.setData(data);
}

let xx = (s, f) => {
	document.getElementById(s).addEventListener("click", () => f());	
}

xx('btn5', () => setData(5));
xx('btn30', () => setData(30));
xx('btn8000', () => setData(8000));
xx('btnSelectCode5', () => vgrid.findAndSelect('Code5', 'code'));
//xx('btnCreateGrid', () => createGrid());
xx('btnClearRows', () => setData(0));
//xx('btnDestroyGrid', () => vgrid.destroy());
//xx('btnGetSettings', () => _col_settings = vgrid.getSettings());
xx('btnGroup1', () => vgrid.setGroupColumns(['currency']));
xx('btnGroup2', () => vgrid.setGroupColumns(['currency', 'county']));
xx('btnUnGroup10', () => vgrid.setGroupColumns([]));
//xx('btnRefresh', () => vgrid.refresh());


xx('btnUpdateCell', () => {
    let row = vgrid.getCurrentRow();
	let info = UpdateRowInfo.updateSingleCell(row.code, "county", "Essex");
	vgrid.updateData(info);
});

xx('btnUpdateRow', () => {
	let row = vgrid.getCurrentRow();
	row.valuation = 9010.55;
	row.county = "London";

	let info = UpdateRowInfo.updateRow(row);
	vgrid.updateData(info);
});
