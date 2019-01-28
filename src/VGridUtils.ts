import { GridColumn } from './GridColumns';

export class FindRowInfo {
	public findIDColumn: string = "";
	public findIDValue: string = "";
}  

// created by a used when an update to the data is requested.
export class UpdateRowInfo {
	// row identifiers
	public findIDColumn: string = "";
	public findIDValue: string = "";
	
	// update cell info
	public columnToUpdate: string = "";
	public columnNewValue: any;

	public updatedRow: any;			// update an existing row
	public newRow: any;				// insert a new row

	public ignoreEngineUpdate: boolean = false;
	
	public static updateRow(updatedRow: any): UpdateRowInfo {
		let info = new UpdateRowInfo();
		info.updatedRow = updatedRow;
		return info;
	}

	public static updateSingleCell(findIDValue: any, columnToUpdate: any, columnNewValue: any): UpdateRowInfo {
		let info = new UpdateRowInfo();
		info.findIDValue = findIDValue;
		info.columnToUpdate = columnToUpdate;
		info.columnNewValue = columnNewValue;
		return info;
	}
}  

// Used internally by the VGrid when a request for a selection comes in...
export class SelectRowInfo {
	public selectFirstRowIfNoneSelected: boolean = true;
	public clearOtherSelections: boolean = true;
	public rowNo: number;
	public row: any;
	public ctrlKey: boolean;
	public shiftKey: boolean;
	public altKey: boolean;
	public findIDColumn: string = "";
	public findIDValue: string = "";
	public moveSelectedRowIntoViewport: boolean = true;
	public dblClickedColumn: string = "";
	public ClickedColumn: string = "";

	get hasModifierKeys() { return this.ctrlKey || this.shiftKey || this.altKey }
}  

  // --------------------------------------------------------------------------------------------------------------------------------

  // This is given to the user and informes it about which row(s) were selected, column clicked,
  // where the event comes from and a whole lot more!
  export class GridStateInfo {
    public gridKey: string = "";
    public idColumn: string = "";
    public context: string = "";
	public contextSub: string = "";
	public isGroupHeader: boolean = false;
	public groupLevel: number = 0;
	public selectedPKValue: string = "";            // the selected pkValue
    public selectedIDValue: string = "";            // the selected IDValue (based on the idColumn)
    public selectedRow: any = null;                 // the selected rowitem
    public selectedRowHasChanged: boolean = false;  // has the rowItem changed from the last time we raised?
    public origin: string = "";                     // what/who caused this change
    public selectedRows: any[] = [];
    public checkedRows: any[] = [];
	public totalRowCount: number = -1;
	public column: GridColumn = undefined;
    public columns: GridColumn[] = [];
    public dblClickedColumn: string = "";             // row was double clicked
    public gridDisplayMode: string = "";            // what display mode is the grid currently
    public lastAction: string = "";                 // the last formal 'action' given to the store
    //public lastRefData: any = null;                 // the last reference data given by a client widget when invoking an instruction back to the grid

    constructor() {
        
    }

    public toString() {
        let pkvalue: string = "no row";
        if (this.selectedRow) pkvalue = this.selectedRow['pkvalue'];
        return `** gridID: ${this.gridKey}, selected pkvalue: ${pkvalue}, changed: ${this.selectedRowHasChanged}, origin: ${this.origin}, selRowsCount: ${this.selectedRows.length}, checkedRowsCount: ${this.checkedRows.length}`
    }
}

// --------------------------------------------------------------------------------------------------------------------------------

export class CellStyleInfo {

	// ----------------------------------------------------------
	// This is the already filled up style that will be applied, it will be adjusted by
	// the other properties if these are given!
	// ----------------------------------------------------------
	public style: any = {};		

	public row: any = undefined;			// the current row
	public col: GridColumn = undefined;		// the current column
	public state: any = undefined;			// the store's state

	public textRaw: any;					// the raw original value of the cell
	public isTotalRow: boolean = false;		// true if we are asking to custom style the total row
	public isGroupRow: boolean = false;
	public groupLevel: number = -1;
	public groupCurrencyCode: string = "";	// the curr code the grouping rows have in common if all the same, else MIXED
	public groupRowCount: number = 0;
	public rows: any[] = [];

	// these properties can be adjusted -----
    public backgroundColor: string = "";
    public color: string = "";
	public faImage: string = "";
	public faImageColour: string = "";
	public textDisplay: any;				// this can be adjusted and is what is shown to the user
	// --------------------------------------
	

    constructor(style: any, text: any, col: GridColumn, row: any, state: any) { 
		this.style = style;
		this.row = row;
		this.col = col;
		this.state = state;

		this.backgroundColor = style.backgroundColor;
		this.color = style.color;
		this.faImage = style.faImage;
		this.textDisplay = text;
		this.textRaw = text;

		this.isGroupRow = row.__groupLevel > 0;
		if (this.isGroupRow) {
			this.groupLevel = row.__groupLevel;
			this.groupCurrencyCode = row.__groupCurrencyCode;
			this.groupRowCount = row.__groupRowCount;
		}
	}

	public toStyle() {
		this.style.backgroundColor = this.backgroundColor;
		this.style.color = this.color;
		this.style.faImage = this.faImage;
		this.style.faImageColour = this.faImageColour;
		this.style.text = this.textDisplay;

		return this.style;
	}

}



// --------------------------------------------------------------------------------------------------------------------------------

export enum ShowHide {
	fixShow,
	fixHide,
	initialShow,
	initialHide
}

export enum FilterStyleMode {
	Hidden,
	DropDown,
	Horizontal
}
  
// --------------------------------------------------------------------------------------------------------------------------------

export class Currencyinfo {
	constructor (public Code: string, public Sign: string) {}
}  


// --------------------------------------------------------------------------------------------------------------------------------


// An instance of this is created by the client with instructions on HOW to create a RGrid instance - if does NOT provide any
// current state of the grid!
export class VGridSettings {
	
	// ----------------------
	// properties
	// ----------------------
	//public context: string = "";
	//public sub: string = "";
	public friendlyName: string = "";
	//public gridKey: string = "";
  
	//public elID: string = "";
	public el: HTMLElement | string;

	public showCheckbox: boolean = false;           // if true it will display a checkbox in front of each row allowing for mutiple rows to be selected

	public settings: string = "";					// holds a previous saved columns settings that needs to be applied again
	public columns: GridColumn[] = [];
	//public adHocData: any;                          // if given this is used to create an ad-hoc column-defs from
  
	public allowReset: boolean = true;              // if false it will prevent this grid from being Reset by the user (in cases where the grid is constructed through code) 
	//public stylesMode: FilterStyleMode = FilterStyleMode.DropDown;      // if set to false we will not show the styles in the filter|styles bar
	//public filtersMode: FilterStyleMode = FilterStyleMode.DropDown;     // if set to false we will not show the filters in the filter|styles bar
	public showLastRefreshTime: boolean = false;        // it true it shows (and calc) the lapsed time since last refresh...
	public idColumn: string = "";
	public freezeFilters: boolean = false;           // if true, the user won't be able to use the filter popups on grid columns (existing filters still work!)
	//public freezeStyles: boolean = false;            // if true, the user won't be able to make any changes to the layout strip (select other layouts or make new ones)
	//public isAdmin: boolean = false;
	public canSort: boolean = true;
	public blankIfZero: boolean = false;
	//public showFilterRowCounts: boolean = true;     // if true, we will calculate and show the row counts for each filter
	//public barModeFilterStyle: ShowHide = ShowHide.initialShow;
	public barModeGroupBar: ShowHide = ShowHide.initialHide;
	public showDefaultSortOptions: boolean = false  // if true, small asc/desc buttons are shown sorting on pkvalue
	//public showClearDataOption: boolean = false;    // if true, we will show the clear data option allowing the user to clear all data
  
	public showControlBar: boolean = true;          // set to false to hide the entire bottom control bar
	public colourRowSelect: boolean = true;         // if true it shows the selected row in 'orange' if false, no colour...
	public allowRowSelect: boolean = true;          // if false it will block selection of rows full stop
	public allowRowMultiSelect: boolean = false;    // if false it will block multi-row selection
	//public customTemplateMinWidth: number = 100;    // specifies the minimum width of the custom template in the top of grid
	public showCellContentOnDblClick = false;       // if true it will show the full cellcontent when double clicked..
	public showCellContentOnDblClickCols: any[] = [];      // an array of columns that upon dbl click will show the content of that cell.
	//public frozenColumnsLeft: string[] = [];        // specifies columns that are frozen and which order... (left)
	//public frozenColumnsRight: string[] = [];       // specifies columns that are frozen and which order... (right)

	
	// ----------------------
	// currencies
	// ----------------------
	public currencyLookupColumn = "";				// a column dedicated to providing the currency code for any other fields (currencyColumns) in that row
	public currencyColumns: string[] = [];			// a list of columns that need formatting using the LookupColumn
	public currencyCodes: Currencyinfo[] = [];		// a list of key/value pairs of currency codes/signs
	
	public clearCurrencySymbols() { this.currencyCodes.length = 0; }
	
	public setCurrencySymbol(code: string, symbol: string) {
		this.currencyCodes.push(new Currencyinfo(code, symbol));
	}

	public getCurrencySymbol(code: string) {
		let item = this.currencyCodes.find(i => i.Code.isSame(code));
		return item ? item.Sign : "?";
	}

	// ----------------------
	// callbacks
	// ----------------------
	public cellStyling: (style: CellStyleInfo) => any = undefined;
	//public requestFreshData: (result: (ret: boolean) => void) => void = undefined; 
	public requestFreshData: (grid) => boolean = undefined;
	public createdGridStructure: (grid) => void = undefined;                                // the grid structure is shown (data can still take some time...)

	public vgrid: any = undefined;

	// public createStateInfo: () => GridStateInfo;                                        // a function placed when creating the grid (within RGrid) allowing me later to create a 'state-of-play' of the store (deeper within grid)
  
	// //public requestFreshData: (success: boolean) => JQueryPromise<boolean> = undefined;                                    // a request for new data (user clicked the 'last refresh xx minutes' link
	// public requestFreshData: (result: (ret: boolean) => void) => void = undefined;                                    // a request for new data (user clicked the 'last refresh xx minutes' link
	// //public requestFreshData: () => void = undefined;                                    // a request for new data (user clicked the 'last refresh xx minutes' link
	// public newColDefsRetrieved: () => void = undefined;                                 // a brand new set of coldefs was retrieved (and applied)
	// public createdGridStructure: () => void = undefined;                                // the grid structure is shown (data can still take some time...)
	// public retrievedFilterStyle: () => void = undefined;                                // the grid's filters and styles have been retrieved
	// public createdGridStore: (store: GridStore) => GridStore = undefined;               // last chance to make changes to the store before it is applied to the grid..
	// public createdListSplitElements: ($list: JQuery, $split: JQuery) => void = undefined;   // the elements created in the details list and split modes (we can drop a dashboard on these elements now)
	// public createdCustomHeaderElement: ($header: JQuery) => void = undefined;                // the custom header center element that the user can replace (fill in) with their own template...
	// //public createListScrollItem: (row: any, getFormattedValue: (row: any, colName: string) => string) => JSX.Element;                 // allows a user to provide a (jsx) custom cell for the list-cell items
	// public exportAllData: () => JQueryPromise<any[]>;               // if a handler is given then the caller promises to handle the export function for cases where > 5000 rows
	// public showMessage: (msg: string, wait: number) => void;        // if a handler is given the grid will use this to show any 'grid info' messages to the user, if not it will use a toastr message
  
	// constructor(context: string, sub: string, $el: JQuery, settings: string) {  
	//     this.context = context;
	//     this.sub = sub;
	//     this.$el = $el;
	//     this.settings = settings;
	// }
}




// --------------------------------------------------------------------------------------------------------------------------------





// import * as _ from 'lodash';
// import * as __core from './core'
// import { GroupDisplayMode } from './actionTypes'

// // --------------------------------------------------------
// // Describes all meta regarding a grid column
// // --------------------------------------------------------
// export class GridColumn {
//     public header: string = "";
//     public dbName: string = "";
//     public spanText: string = "";
//     public order: number = -1;   
//     public order_ori: number = -1;        // temp
//     public format: string = "";
//     public currencyLookUp: string = "";   // this col references another column to display its currency
//     public formula: string = "";
//     public type: string = "string";
//     public align: string = "left";
//     public sortDirection: string = ""
//     public width: number = 0;
//     public groupAggregate: string = "";   // sum, etc
//     public minWidth: number = 0;
//     public minLength: number = -1;
//     public maxLength: number = -1;
//     public stateExpCol: string = "";       // expanded, collapsed, mixed
//     public blankIfZero: boolean = false;
//     public isRequired: boolean = false;
//     public isFlexable: boolean = false;
//     public frozenLeft: boolean = false;
//     public frozenRight: boolean = false;
//     public displayable: boolean = true;
//     public visible: boolean = true;
//     public data: string = "";
  
//     public operators: string[] = [];
//     //public ddItems: DDItem[] = [];
  
//     // item -> incoming similar item from the server
//     constructor(koColDef: any = undefined) {
        
//         // if no item is given then stop
//         if (!koColDef) return;
  
//         let self = this;
//         this.dbName = koColDef.colName;
//         this.dbName = this.dbName.toLowerCase();
//         this.header = koColDef.colHeader;
//         this.spanText = koColDef.spanText;
//         this.type = koColDef.colType;
//         this.format = koColDef.colFormat;
//         this.currencyLookUp = koColDef.colCurrLookup;
//         this.formula = koColDef.formula;
//         this.align = koColDef.align;
//         this.sortDirection = koColDef.sort;
//         this.width = koColDef.width;
//         this.order = koColDef.order;
//         this.minWidth = koColDef.minWidth || 0;
//         this.minLength = koColDef.minLength || -1;
//         this.maxLength = koColDef.maxLength || -1;
//         this.order_ori = koColDef.order;
//         this.displayable = koColDef.displayable || true;
//         this.groupAggregate = koColDef.groupAggregate;
//         //this.valMaxLength = item.valMaxLength;
//         //this.groupIndentation = item.groupIndentation;
//         //this.colourable = item.colourable;
//         //this.valMaxLength = item.valMaxLength;
//         this.blankIfZero = koColDef.blankIfZero;
//         this.isRequired = koColDef.isRequired;
//         this.isFlexable = koColDef.isFlexable;
//         this.frozenLeft = koColDef.frozenLeft; 
//         this.frozenRight = koColDef.frozenRight;
//         this.visible = koColDef.visible || true;
//         this.data = koColDef.data || "";
  
//         // push over the operators
//         //this.operators = _.map(koColDef.operators, (s: string) => s)
  
//         //// create new dditems
//         //for (let i = 0; i < item.ddItems.length; i++) {
//         //    let itemTmp: any = item.ddItems[i];
//         //    this.ddItems.push(new DDItem(itemTmp));
//         //}
  
//         // fill in the operators with the correct fields if none are given (for number type cols only)
//         if (this.type == "formula" && this.operators.length == 0) {
//             this.operators.push("<");
//             this.operators.push("=");
//             this.operators.push(">");
//         }
  
//     }
  
//     public adjust(key: string, value: any) {
//         // assign the key to the header and dbName
//         this.dbName = this.header = key.toLowerCase();
  
//         // now interpret the type
//         if ($.isNumeric(value)) {
//             this.type = "number";
//             this.align = "right";
//             this.format = "#,##0";
//         }
//         if (key.toLowerCase().contains("date")) {
//             this.type = "datetime";
//             this.align = "center";
//             this.format = "";
//         }
//     }
  
//     // If we have managed to get info from the db regarding the TRUE column type then set it
//     public adjustByOrclInfo(type: string) {
//         // assign the key to the header and dbName
//         //this.dbName = this.header = key.toLowerCase();
  
//         if (type.isSame("string")) {
//             this.type = "string";
//             this.align = "left";
//         }
//         // now interpret the type
//         if (type.isSame("decimal")) {
//             this.type = "number";
//             this.align = "right";
//             this.format = "#,##0";
//         }
//         if (type.contains("date")) {
//             this.type = "datetime";
//             this.align = "center";
//             this.format = "";
//         }
//     }
  
//     public static IsExportable(col: GridColumn) {
//         //return col.type.isIn(["number", "boolean", "string", "quantity", "checkbox", "formula"]);
//         return col.type.isNotIn(["custom"]);
//     }
//   }


// // --------------------------------------------------------
// // represent a single style that can be selected (active) 
// // --------------------------------------------------------
// export class RGMenuItem {

//     public id: string = "";
//     public code: string = "";
//     public name: string = "";
//     public faImage: string = "";
//     public isSelected: boolean = false;
//     public isDisabled: boolean = false;
//     public isVisible: boolean = true;
//     public className: string = "";
//     public data: any;               // just a handy repository to store associate objects...
//     public clicked: any;            // hmmm... I will use this to hook a function callback to for header menu items

//     constructor(name: string, clicked: any = null) {
//         this.id = __core.createGuidRight5();
//         this.name = name;
//         this.clicked = clicked;

//         if (this.code.length == 0)  // lets always set the code.... 
//             this.code = name;
//     }

// }


// // --------------------------------------------------------
// // represent a single style - it holds columns that represents the view of the grid
// // --------------------------------------------------------
// export class RGStyle extends RGMenuItem {

//     public columns: GridColumn[] = [];

//     public groupColumns: string[] = [];
//     public groupDisplayMode: string = GroupDisplayMode.VALUEWITHCOUNT;

//     public collapsedHeaders: string[] = [];      // specific group header rows that are 'collapsed'
//     public expandedHeaders: string[] = [];       // specific group header rows that are 'expanded'
//     public allCollapsedHeaders: string[] = [];   // blanket collapse all rowheaders for the given column(s)

//     constructor(name: string) {     // , item?: RGStyle
//         super(name);

//         this.hasColumns = this.hasColumns.bind(this);
//     }

//     public hasColumns(): boolean {
//         if (Array.isArray(this.columns))
//             return this.columns.length > 0;
//         else {
//             return _.size(this.columns) > 0;
//         }
//     }

//     // synchronise with the given RGStyle - we ONLY synch properties that make sense (like align, format, header etc), NOT for
//     // user specific props such as width or sort
//     public sync(style: RGStyle) {
//         if (!style) return;

//         // make sure our 'columns' property is of type Array
//         this.columns = _.toArray(this.columns);

//         // update existing columns and insert new ones if they were added
//         _.each(style.columns, (col: GridColumn) => {
//             let localCol: GridColumn = _.find(this.columns, c => c.dbName.isSame(col.dbName));
//             if (localCol) {
//                 localCol.align = col.align;
//                 localCol.header = col.header;
//                 localCol.spanText = col.spanText;
//                 localCol.format = col.format;
//                 localCol.formula = col.formula;
//                 localCol.currencyLookUp = col.currencyLookUp;
//                 localCol.type = col.type;

//                 localCol.minWidth = col.minWidth;
//                 localCol.minLength = col.minLength;
//                 localCol.maxLength = col.maxLength;
//                 localCol.displayable = col.displayable;
//                 localCol.groupAggregate = col.groupAggregate;
//                 localCol.blankIfZero = col.blankIfZero;
//                 localCol.isRequired = col.isRequired;
//                 localCol.isFlexable = col.isFlexable;
//                 localCol.frozenLeft = col.frozenLeft;
//                 localCol.frozenRight = col.frozenRight;
//                 localCol.data = col.data;
//             }
//             else {
//                 // if the incoming given style has a column (visible) that we don't have then add it...
//                 if (col.visible) 
//                     this.columns.push(col);
//             }
//         });

//         // 
//         let hasItem = (colName: string) => style.columns.hasItem((n: GridColumn) => n.dbName.isSame(colName));
//         let notHasItem = (colName: string) => !(hasItem(colName));

//         let xx4 = this.columns.filter((item: GridColumn) => notHasItem(item.dbName));

//         // -----------------------------------------------------------
//         // remove any columns that we have but the given style no longer has (Mike has removed it from db)
//         // -----------------------------------------------------------
//         this.columns.removeAll((item: GridColumn) => notHasItem(item.dbName));

//     }

// }

// // --------------------------------------------------------
// // represent a single filter - it holds a number of filter columns (that we are filtering on)
// // --------------------------------------------------------
// export class RGFilter extends RGMenuItem {

//     public filters: FilterBase[] = [];
//     public rowCount: number = 0;

//     constructor(name: string, filters: FilterBase[] = [], faImg: string = "") {
//         super(name);
//         this.filters = filters;
//         this.faImage = faImg;
//     }

//     public static getFilterDescription(filter: RGFilter) {
//         if (filter.filters.length == 0) return "no filters";
//         let s = "";
//         //_.each(filter.filters, f => s += FilterHelper.getFilterDescription(f) + " ");
//         return s;
//     }
// }

// // --------------------------------------------------------
// // the base filterable column that is held by a single RGFilter
// // --------------------------------------------------------
// export class FilterBase {

//     public colName: string = "";
//     public typeName: string = "";
//     public templateID: string = "";     // the templateid associated with the specific derived implementation
//     public hidden: boolean = false;     // if true it will NOT be shown with the icon but the data WILL always be filtered based on this filter

//     constructor(typeName: string, templateID: string, colName: string) {
//         this.typeName = typeName;
//         this.templateID = templateID;
//         this.colName = colName;
//     }

// }