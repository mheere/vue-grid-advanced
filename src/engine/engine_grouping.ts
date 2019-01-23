import * as Enumerable from 'linq'
import * as _ from 'lodash'
import * as R from 'ramda'
import * as $ from 'jquery'
import { GridColumn} from '../GridColumns'
import { performEnumerableSort, EngineOptions } from './engine_utils'

//let P: any = require('./parser')
//let Parser = P.Parser

//declare let Parser;     // allows the use of the Parser js library without any further type checking. 

export class VueGridEngineGrouper {
    
    public sortColumn: string = ""
    public sortDirection: string = ""
    public formulaColInfos: FormulaColInfo[] = [];             // info regarding formula columns
    
    //private _groupingColumns: string[] = [];
    private _groupingColumnsReverse: string[]
 
	private currencyAggregates: string[] = [];                   // the column grouping structure
	private aggregateColInfos: AggregateColInfo[] = [];         // info regarding aggregate columns

	private _options: EngineOptions = null;
	private _groupDisplayMode: string = "";
	//private _allExpandedHeaders: string[]
	private _allCollapsedHeaders: string[] = [];

    //private _expandedHeaders: string[] = [];    // hang on to the collapsed headers so when we redo grouping or sorting etc we can initialise the correct header rows again
    //private _collapsedHeaders: string[] = [];    // hang on to the collapsed headers so when we redo grouping or sorting etc we can initialise the correct header rows again
    private _stateExpCol: Map<string, string> = new Map<string, string>()


   // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    private __id: number = 0;
    private headerRowsMngr: HeaderRowMngr = new HeaderRowMngr()
    private groupHeaderPKValueCounter: number = -1
    
    // -------------------------------------------
    // calc the grouping data
    // -------------------------------------------
    public calcGroupingData(rows: any[], options: EngineOptions) {

        this._options = options;
        //this._groupingColumns = options.groupingColumns;
        //this._collapsedHeaders = options.collapsedHeaders;

        // if there is nothing to do then stop 
        if (options.groupingColumns.length == 0 || rows.length == 0)
            return rows

        // reverse the groupingColumns - always start from the bottom for grouping
        this._groupingColumnsReverse = options.groupingColumns.slice(0).reverse();
            
        // get the grouping columns we need to group on
        let groupCols: string[] = options.groupingColumns.slice(0)

        // reset the start of negative pkvalue assigning of the groupheaders
        this.groupHeaderPKValueCounter = -1;

        // ---------------------------------------------------------
        // check if we need to introduce another base level (in case of multiple top rows)
        // ---------------------------------------------------------
        let groupColName: string = groupCols[0]

        // get distinct groups for this groupColName
        let groupRows: any = Enumerable.from(rows).distinct(function (x) { return x[groupColName]; })
        groupRows = groupRows.toArray()

        //if we have more than 1 group then introduce an artificial top group to capture things like 'sum' etc for the real top most groups.
        if (groupRows.length > 1) {
            // insert a fictitious field that we can group on to get a master(total) outer group
            groupCols.unshift("__mybasetemp")

            // add this temp field to each row
            _.each(rows, r => r.__mybasetemp = 0)
        }

        // now iterate through all this data
        this.processGrouping(groupCols, rows);  

        // if caller wishes us to return the whole prepares set (irrespective of collapse regions) then
        // do not process these collapsed regions!
        if (!options.returnFullSet)
            rows = this.postExpandCollapsePrepareDisplayable(this.rowsStructured);
        
        return rows;                        
    }

    //private collapsingLevel: number = 99;

    // ------------------------------
    // start grouping all relevant raw rows with the given grouping cols
    // - is called recursively till the groupCols array is consumed fully
    // ------------------------------
    private rowsStructured: any[] = [];                      // ALL grouped items nicely structured with formula's filled in

    private processGrouping(groupCols: string[], rows: any): any[] {
        
        // prepare empty return array
        let retRows: any[] = []

        // stop if there are no more groups to process
        if (groupCols.length == 0) return; 
            
        // get the group column name
        let groupColName: string = groupCols[0];

        // get distinct groups for this groupColName
        let groupRows: any = Enumerable.from(rows).distinct((x: any) => x[groupColName]);

        // order by group name always in asc order
        groupRows = performEnumerableSort(groupRows, groupColName, "asc");

        // cast to array
        groupRows = groupRows.toArray();

        // scan through these distinct rows and create new group rows from them
        _.each(groupRows, (distinctItem: any) => {

            // get the value of the column we are grouping on
            let groupColNameValue = distinctItem[groupColName];

            // get a sub set of rows for each value (USD, GBP)
            let subGroupRows1: any = Enumerable.from(rows).where((x: any) => x[groupColName] == groupColNameValue);

            // if need to do sorting then do so
            subGroupRows1 = performEnumerableSort(subGroupRows1, this.sortColumn, this.sortDirection);

            // cast the enumerable to a real array I can work on
            let subGroupRows: any[] = subGroupRows1.toArray();

            // create a new group row for this sub group
            let newGroupRow = this.createGroupHeaderRow(groupColName, subGroupRows, subGroupRows1, distinctItem, groupCols);
            this.rowsStructured.push(newGroupRow);

            // hang on to this header row
            this.headerRowsMngr.add(newGroupRow.__groupLevel, newGroupRow);

            // add the section of rows to the self.sortedRows (only when we are on lowest level!)
            if (groupCols.length == 1) {
                _.each(subGroupRows, (row: any) => {
                    row.__id = this.__id++;
                    row.__parentRow = newGroupRow;                  // hang on to my full parent (for internal aggregate lookup)
                    row.__parentRowID = newGroupRow.__id;           // keep a ref id to our parent
                    this.rowsStructured.push(row);                            // push onto our list
                });
            }

            // now iterate if there are more items - reduce the cols array (but do NOT amend the original)
            this.processGrouping(groupCols.slice(1), subGroupRows);
        });
    }

    // create a group header row
    private createGroupHeaderRow(groupColName: string, subGroupRowsIn: any, enumerableGroupRows: any, 
            distinctItem: any, cols: string[]): any {

        // create new groupheader row for this group and do its sums now!
        let newRow = $.extend(true, {}, distinctItem);
        //let newRow = Object.assign({}, distinctItem) 

        // new new new - clear out ALL properties before working with this row...
        R.forEach(key => { newRow[key] = undefined; }, R.keys(newRow));

        // re-insert the groupColName's value... so it can be easily displayed
        newRow[groupColName] = distinctItem[groupColName];

        // get an Enumerable from the given array
        let subGroupRows: any = Enumerable.from(subGroupRowsIn);

        // let colCurrLookUP = this._options.colCurrLookUp;
        // let distinctRows = subGroupRows.select(r => r[colCurrLookUP]).distinct().toArray();
	    // let currCode = distinctRows.length == 1 ? distinctRows[colCurrLookUP] : "MIXED";

        // we created a new ad hoc row so set the group properties
        newRow.__id = this.__id++;
        newRow.__groupRowCount = subGroupRows.count();    // hang on to the number of rows for this group
        newRow.__groupLevel = cols.length;                // so groupLevel will ALWAYS be 1 and higher!!   -- // 0 is normal row, 1 is the level above, 2 above that, etc.  - 
        newRow.__groupLevelInverse = (this._options.groupingColumns.length) - cols.length
        newRow.__groupColName = groupColName;
        newRow.__isGroupHeader = true;
        newRow.__isExpanded = true;
        newRow.__groupKey = "";                 // uniquely identifies a group row (used when we collapse regions)
        newRow.__groupCurrencyCode = "";        // check currency code

        if (newRow.hasOwnProperty('pkvalue')) {
            newRow.pkvalue = "000" + this.groupHeaderPKValueCounter--;   // i.e. "000-3"
        }

        // get the lastest stored parent row (this will be ours!) and assign it to this new group row
        let parentHeaderRow: HeaderRow = this.headerRowsMngr.getRow(newRow.__groupLevel + 1);
        if (parentHeaderRow) {
            newRow.__parentRow = parentHeaderRow.row;
            newRow.__parentRowID = parentHeaderRow.row.__id;

            let pre = parentHeaderRow.row.__groupKey;
            if (pre) pre += ",";
            newRow.__groupKey = pre + newRow.__groupLevel + "_" + newRow[groupColName];
        }
        else {
            newRow.__parentRow = {};
            newRow.__parentRowID = -1;
            newRow.__groupKey = "";
        }

        // 
        this.calcAggregatesForHeaderRow(newRow, subGroupRows);

        return newRow;
    }

    private calcAggregatesForHeaderRow(rowHeader: any, subGroupRows: any) {

        // now we have the group row and ALL its subrows - check their currencies if a curr lookup column is given
        let colCurrLookUP = this._options.colCurrLookUp;
        if (colCurrLookUP) {
            let distinctRows = subGroupRows.select(r => r[colCurrLookUP]).distinct().toArray();
            let currCode = distinctRows.length == 1 ? distinctRows[0] : "MIXED";
            rowHeader.__groupCurrencyCode = currCode;   // just store the code (we substitue for a sign later)
        }

        // check if there are aggregates to calculate
        let colsAggregates = this._options.cols.filter(c => c.aggregate.length > 0);

        colsAggregates.forEach(col => {

            let colName: string = col.dbName;
            let newValue = 0

            if (col.aggregate == "sum")
                newValue = subGroupRows.sum(function (x) { return x[colName]; });
            if (col.aggregate == "avg")
                newValue = subGroupRows.average(function (x) { return x[colName]; });
            if (col.aggregate == "max")
                newValue = subGroupRows.max(function (x) { return x[colName]; });
            if (col.aggregate == "min")
                newValue = subGroupRows.Min(function (x) { return x[colName]; });
            if (col.aggregate == "count")
                newValue = subGroupRows.Count(function (x) { return x[colName]; });
            
            // write out the aggregate value into the property of the grouping row
            rowHeader[colName] = newValue;

            // if (aggInfo.aggregate == "count") {
            //     newRow[colName] = subGroupRows.count(function (x) { return x[colName]; });
            // }

            //if (aggInfo.aggregate == "groupvalue") {                    // simply place the group value 
            //    newRow[colName] = newRow[groupColName];
            //}

            // NOTE - below not too elegant but clear and ready to be changed around - mike now want to get rid of _full and introduce a named equivalent
            // if (aggInfo.aggregate.startsWith("groupvalue")) {

            //     let thevalue = newRow[groupColName];
                
            //     if (aggInfo.aggregate == "groupvalue")                
            //         newRow[colName] = thevalue;

            //     if (aggInfo.aggregate == "groupvaluecount") {               
            //         let count: number = subGroupRows.count(function (x) { return x[colName]; });
            //         newRow[colName] = thevalue + " [" + count + "]";
            //     }

            //     if (aggInfo.aggregate == "groupvaluefull") {
            //         if (newRow.hasOwnProperty(groupColName + "_full"))
            //             thevalue = newRow[colName] = newRow[groupColName + "_full"];
            //         newRow[colName] = thevalue;
            //     }

            //     if (aggInfo.aggregate == "groupvaluefullcount") {               
            //         if (newRow.hasOwnProperty(groupColName + "_full"))
            //             thevalue = newRow[colName] = newRow[groupColName + "_full"];
            //         let count: number = subGroupRows.count(function (x) { return x[colName]; });
            //         newRow[colName] = thevalue + " [" + count + "]";
            //     }

            // }

        });
    }


    // ----------------------------------------------------------
    // NOTE - This is where we actually fill the rows we allow the user to see! (the clever bit)
    // ----------------------------------------------------------
    private postExpandCollapsePrepareDisplayable(rows: any[]): any[] {

        // run through all rows and only include rows that are in expanded mode

        // prepare empty return array
        let retRows: any[] = []

        // a level marker
        let markLevel = -1

        let isCollapsed = false;

        // iterate through and ignore any child rows from a parent that is collapsed
        _.each(rows, (row: any) => {

            let isGroupHeader = row.__isGroupHeader;
            let level = row.__groupLevel;

            if (isGroupHeader) {
                let isCollapsed = this._options.collapsedHeaders.includes(row.__groupKey);
                row.__isExpanded = !isCollapsed;

                if (isCollapsed && level >= markLevel) {
                    retRows.push(row);
                    markLevel = level;
                }
                else if (level >= markLevel) {
                    markLevel = -1;
                    retRows.push(row);
                }
                else if (level < markLevel) {
                    // ignore
                }
                else
                    retRows.push(row);
            }
            else {
                if (markLevel == -1)
                    retRows.push(row);
            }
        });

        return retRows;

    }

    // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

}


// helper class
export class AggregateColInfo {
    constructor(public column: string, public aggregate: string, public formulaUse: boolean) {
    }
}

// helper class - formula
export class FormulaColInfo {
    public evalParser: any;
    constructor(public column: string, public formula: string, public evalFormula: string) {
    }
}

// helper class - manages header row references
export class HeaderRowMngr {

    private rows: HeaderRow[] = [];

    public add(level: number, row: any) {
        _.remove(this.rows, (item: HeaderRow) => { return item.level == level; });
        this.rows.push(new HeaderRow(level, row));
    }
    
    public getRow(level: number): HeaderRow {
        let item: HeaderRow = _.find(this.rows, (item: HeaderRow) => { return item.level == level; });
        return item;
    }

}

// helper class - wrapper aroung a header row
export class HeaderRow {
    constructor(public level: number, public row: any) {
    }
}

