// import * as Enumerable from 'linq'
// import * as _ from 'lodash'
// import * as $ from 'jquery'
// //import { GridStore } from '../store'
// import { GridColumn} from '../GridColumns'
// //import '../utils'

// var P: any = require('./parser')
// var Parser = P.Parser

// //declare var Parser;     // allows the use of the Parser js library without any further type checking. 

// export class VueGridEngine {
    
//     public sortColumn: string = ""
//     public sortDirection: string = ""
//     public formulaColInfos: FormulaColInfo[] = [];             // info regarding formula columns
//     public _groupingColumns: string[] = []
    
//      private currencyAggregates: string[] = [];                   // the column grouping structure
//      //public groupingColumns: string[] = [];                      // the column grouping structure
//     // public groupingColumnsDiff: string[] = [];                  // any columns that are less! than the previous refresh (these are meant so we can clean out the bound dsitem cells to avoid blank cells)
//      //public groupingBackColours: any = {};                       // the background colour for the grouping rows (for convenience we will put these here and prepare them for the headers)
//      //public groupingDefaultBackColour: string = "#F1F1F1";
//     // private groupingColumnsReverse: string[] = [];
//     private aggregateColInfos: AggregateColInfo[] = [];         // info regarding aggregate columns
//     //private formulaColInfos: FormulaColInfo[] = [];             // info regarding formula columns

//     private _expandedHeaders: string[] = [];    // hang on to the collapsed headers so when we redo grouping or sorting etc we can initialise the correct header rows again
//     private _collapsedHeaders: string[] = [];    // hang on to the collapsed headers so when we redo grouping or sorting etc we can initialise the correct header rows again
//     private _stateExpCol: Map<string, string> = new Map<string, string>()

//     public totalsRow: any
    
//     private _hasGrouping: boolean = false;
//     private _groupDisplayMode: string = "";
//     //private _allExpandedHeaders: string[]
//     private _allCollapsedHeaders: string[] = [];
    
//     // ----------------------------------
//     // - calc every single time on change
//     // if returnFullSet is true we return ALL rows (including the ones of regions that are collapsed) 
//     // we return an object with rows and stateExpCol (detailing the current)
//     // ----------------------------------
//     public processData(rows: any[],
//             cols: GridColumn[],
//             groupingColumns: string[] = [], 
//             groupDisplayMode: string = 'VALUEWITHCOUNT',
//             expandedHeaders: string[] = [],
//             collapsedHeaders: string[] = [],
//             allCollapsedHeaders: string[] = [],  
//             returnFullSet: boolean = false): {} {
        
//         // debugger;
//         //console.log(`Engine Run with ${rows.length} rows.`)
        
//         //  setup the _stateExpCol map with entries for each grouping column
//         _.each(groupingColumns, s => this._stateExpCol.set(s, ""))

//         // set a few things        
//         this._groupDisplayMode = groupDisplayMode
//         this._groupingColumns = groupingColumns || []
//         this._hasGrouping = groupingColumns.length > 0
//         this._expandedHeaders = expandedHeaders || []       // linked to _allCollapsedHeaders
//         this._collapsedHeaders = collapsedHeaders || []
//         this._allCollapsedHeaders = allCollapsedHeaders || []
       
//         // 1. prepare raw rows (clones the given rows!)
//         rows = this.prepareRows(rows)
        
//         // 1b. 
//         this.analysColDefs(cols);
        
//         // 1c. 
        
        
//         // 2. filter the rows
        
        
//         // 2b.  calc 'totals' aggregate columns - calc totals prior!! to all other so we can prepare the top (total row) (which we
//         //      may need when doing formula aggregates on a non group set of data etc)
//         this.calculateTotalAggregates(rows);
        
//         // 3. sort the filtered rows
//         rows = this.setSortColumnDetails(rows, cols);

//         // 4. group the rows (if need be)
//         rows = this.calcGroupingData(rows, this._groupingColumns);      
        
//         // 5. calc formula        
//         this.processFormulas(rows);     // process any formulas
        
//         // clear up
//         //_.remove(rows, r => r.__groupColName == "__mybasetemp")
        

//         // if callers wishes to return the FULL data set then return it before cleaning (removing collapsed rows etc)
//         if (returnFullSet)
//             return rows

//         // remove some parent row references
//         rows = this.cleanUp(rows)

//         // remove any items we don't need (they are within a collapsed group)
//         rows = this.postExpandCollapsePrepareDisaplyable(rows)
        
//         // during the cause of a series of calcs there might have been a totalsRow introduced but if there are no real aggregate columns
//         // then remove the totalsRow - 
//         if (this.aggregateColInfos.length == 0)
//             this.totalsRow = null;
       
//         // return the data
//         return { rows, totalsRow: this.totalsRow, stateExpCol: this._stateExpCol }
//     }

//     // attach some properties to every row that we need for grouping    
//     private prepareRows(rows:any) {
//         return _.map(rows, (row: any) => {
//             row.__groupRowCount = 0;                // 0 is normal row, 1 is the level above, 2 above that, etc.  - 
//             row.__groupLevel = 0
//             row.__groupLevelInverse = this._groupingColumns.length; 
//             row.__groupColName = ""
//             row.__isGroupHeader = false
//             row.__parentRow = ""
//             row.__parentRowID = -1
//             row.__isFooter = false
//             return row
//         })
//     }

//     private cleanUp(rows: any[]) {

//         // remove the top most grouprow if it exists
//         _.remove(rows, r => r.__groupColName == "__mybasetemp")

//         // go through all rows and remove what it not necessary
//         var rowsOut = _.map(rows, m => {    
//             delete m.__parentRow
//             delete m.__parentRowID
//             return m
//         })

//         return rowsOut
//     }

//     public addCurrencyAggregate(curr: string) {
//         if (this.currencyAggregates.hasItem2(curr)) return;
//         this.currencyAggregates.push(curr);
//     }

//     private setSortColumnDetails(rows: any, cols: GridColumn[]): any {
//         var match: GridColumn = _.find(cols, (column: GridColumn) => column.sortDirection.length > 0);
//         this.sortColumn = match ? match.dbName : ""
//         this.sortDirection = match ? match.sortDirection : ""  

//         if (match != undefined) {
//             // do a nasty quick check if this is a date make sure there are no 'null' values
//             if (match.type.isSame("date")) {
//                 rows.forEach((r: any) => {
//                     if (!r[match.dbName])
//                         r[match.dbName] = "1900-01-01T00:00:00";
//                 });
//             }

//             var enumerableGroup = Enumerable.from(rows);
//             enumerableGroup = this.performEnumerableSort(enumerableGroup, this.sortColumn, this.sortDirection);
//             rows = enumerableGroup.toArray();

//             // undo the nasty trick
//             if (match.type.isSame("date")) {
//                 rows.forEach((r: any) => {
//                     if (r[match.dbName] == "1900-01-01T00:00:00")
//                         r[match.dbName] = null;
//                 });
//             }
//         }  
        
//         return rows
//     }

//     private performEnumerableSort(enumerableObj: any, sortOnColumn: string, sortDirection: string) {
//         // if need to do sorting then do so
//         if (sortOnColumn.length > 0) {
//             if (sortDirection == "asc")
//                 enumerableObj = enumerableObj.orderBy("x=>x." + sortOnColumn);
//             else
//                 enumerableObj = enumerableObj.orderByDescending("x=>x." + sortOnColumn);
//         }
//         return enumerableObj;
//     }
    
//     //--------------
    
//     public analysColDefs(cols: GridColumn[]) {
        
//         // _.each(cols, (col) => {
//         //     if (col.formula.length > 0) 
//         //         this.formulaColInfos.push(new FormulaColInfo(col.name, col.formula, ""));
//         // })
        
//         // // -----------------------
//         // // check the formulas for any aggregate columns we might need - if found then add these to our aggregateColInfos list
//         // // -----------------------
//         // this.formulaColInfos.forEach(function (formulaColInfo: FormulaColInfo) { self.calcFormulaCell(formulaColInfo, null); });
        
//         // iterate
//         _.each(cols, (col: GridColumn) => {

//             // if this column represents an aggregate then add this one to the dataGroupEngine
//              if (col.groupAggregate.length > 0 && !col.groupAggregate.isSame("none"))
//                  this.setAggregate(col.dbName, col.groupAggregate);

//             // if column has a formula then add this formula to the engine
//             if (col.formula.length > 0) {
//                 var fci = new FormulaColInfo(col.dbName, col.formula, "")
//                 this.formulaColInfos.push(fci)
//                 this.calcFormulaCell(fci, null);
//             }

//             // if the definition stipulates a colour in case this column is used for grouping then pass it on
//             //if (col.groupColour.length > 0)
//             //    this.groupingBackColours[col.name.toLowerCase()] = col.groupColour;

//             // if the definition 
//             if (col.currencyLookUp && col.currencyLookUp.length > 0)
//                 this.addCurrencyAggregate(col.currencyLookUp);
//         });
            
//     }
    
//     // the given column might not exist in which case we create a field for it - 
//     // NOTE - by setting formulat one by one it creates an implicit hierarchy in which they are executed thus allowing for nested formula's!
//     // public setFormula(column: string, formula: string) {
//     //     column = column.toLowerCase();
//     //     this.formulaColInfos.push(new FormulaColInfo(column, formula, ""));
//     // }


//     private evalParserStringTemp: string = "";
//     private __ph: number = 0;

//     // ------------------------------------------------------
//     // process all formula's that were setup for this engine instance
//     // ------------------------------------------------------
//     private processFormulas(rows: any[]) {
//         if (rows.length == 0) return;
        
//         // i.e.  [no_of_children]*[valuation]
//         // i.e.  Sum[price]*([no_of_children]/Sum[no_of_children])
//         // i.e.  Average[price]*([no_of_children]/(Min[no_of_children]+1))
//         var self = this;

//         // step through each formula and process the number of rows
//         this.formulaColInfos.forEach(function (formulaColInfo: FormulaColInfo) {

//             var formCol: string = formulaColInfo.column.toLowerCase();

//             for (var i: number = 0; i < rows.length; i++) {
//                 var row = rows[i];

//                 // create a temp holding array for the values we are going to inject into the parser
//                 row.parserValues = [];

//                 // calculate the formula and assign the result to the property (this is created if it didn't exist)
//                 row[formCol] = self.calcFormulaCell(formulaColInfo, row);

//                 // remove any temp holding values...
//                 delete row.parserValues;
//             }
//         });
//     }

//     // this disects the formula string and performs the calculation returning the formula value 
//     // NOTE - if row is null then it is meant to extract formula aggregate columns we need to aggregate before we can use this.
//     private calcFormulaCell(formulaColInfo: FormulaColInfo, row: any): number {

//         var self = this;

//         // reset the __ph placeholder variable
//         this.__ph = 0;

//         // check the format of the given coldef to check which columns's values I need to find
//         var f: string = _.trim(formulaColInfo.formula);

//         // process this formula field
//         this.evalParserStringTemp = "";     // blank out the eval string
//         while (f.length > 0) {
//             var singleChar = f.substr(0, 1).toUpperCase();

//             if ("()*/+-".indexOf(singleChar) > -1)
//                 f = this.getOperator(f);

//             else if ("0123456789".indexOf(singleChar) > -1)
//                 f = this.getOperator(f);

//             else if (singleChar == "S" || singleChar == "T") {
//                 if (!row) this.setFormulaAggregateColInfo(f, "sum");        // no row so examine if we need this for formula purpose
//                 f = this.getCalculatedAggField(f, "sum", row);              // i.e. Sum[price]*([no_of_children]/Sum[no_of_children])
//             }

//             else if (singleChar == "A") {
//                 if (!row) this.setFormulaAggregateColInfo(f, "avg");    // no row so examine if we need this for formula purpose
//                 f = this.getCalculatedAggField(f, "avg", row);
//             }

//             else if (singleChar == "M") {
//                 var s2 = f.substr(1, 1).toUpperCase();
//                 if (s2 == "A") { // mAx
//                     if (!row) this.setFormulaAggregateColInfo(f, "max");    // no row so examine if we need this for formula purpose
//                     f = this.getCalculatedAggField(f, "max", row);
//                 }
//                 if (s2 == "I") { // mIn
//                     if (!row) this.setFormulaAggregateColInfo(f, "min");    // no row so examine if we need this for formula purpose
//                     f = this.getCalculatedAggField(f, "min", row);
//                 }
//             }

//             else if (singleChar == "[") {
//                 f = this.getFieldValue(f, row);
//             }

//             else
//                 f = "";
//         }

//         // evaluate the combined formula field - if this fails output n/a
//         var res: number = 0;
//         try {

//             // only evaluate if a row was given (no row was meant for formula checking and parser generation!)
//             if (!row)
//                 formulaColInfo.evalParser = Parser.parse(this.evalParserStringTemp);    // create a parser instance for this single formula
//             else {

//                 // reset the placeholder variable - ready for next formula
//                 this.__ph = 0;

//                 // create an object that will hold the variables we are going to 'inject' (pass onto) the parser.
//                 var myvalues: any = {};

//                 // add properties that represent the placeholders and their associated values.
//                 row.parserValues.forEach(function (myval: any) {
//                     var xx2 = self.getNextPlaceholder();
//                     myvalues[xx2] = myval;
//                 });

//                 // 'evaluate' the values into the formula
//                 res = formulaColInfo.evalParser.evaluate(myvalues);

//             }
//         }
//         catch (e) {
//             res = NaN;
//             console.debug("Error in calcFormulaCell: " + e.message);
//         }

//         // check for sanity
//         if (!this.isSaneNumber(res)) return NaN;

//         return res;
//     }

//     // retrieves the field we need to perform an aggregate function on and hang on to it (so we can do it when doing aggregates)
//     private setFormulaAggregateColInfo(s: string, calcType: string) {
//         var colName = s.retrieveInBetween2("[", "]");
//         this.setAggregate(colName, calcType, true);         // true for formula use - user is (might) not interested in this aggregate
//         return;
//     }

//     private getOperator(s: string): string {
//         var operator: string = s.substr(0, 1);
//         this.evalParserStringTemp += operator;
//         return s.substr(1);
//     }

//     private getCalculatedAggField(s: string, calcType: string, row: any): string {
//         var colName = s.retrieveInBetween2("[", "]");

//         if (!row)
//             this.evalParserStringTemp += this.getNextPlaceholder();         // returns placeholder like x0, x1, x2 etc for within the string that is going to be parsed
//         else {

//             // get parent row for aggregates
//             var parentrow = row.__parentRow;

//             // construct a prop that points at the precalculated row - 
//             var prop = "__formula_internal_" + colName + "_" + calcType;

//             // if we are in a straight forward list of rows mode (non grouping) 
//             if (!this._hasGrouping && this.totalsRowInternal.hasOwnProperty(prop)) {
//                 row.parserValues.push(this.totalsRowInternal[prop]);
//             }
//             else {
//                 // IN GROUPING mode - check if we have calculated this value in addition to the ones we had to anyway...
//                 if (parentrow.hasOwnProperty(prop))
//                     row.parserValues.push(parentrow[prop]);
//                 else
//                     row.parserValues.push(parentrow[colName]);
//             }
//         }

//         s = s.removeTill("]", true);
//         return s;
//     }

//     private getFieldValue(s: string, row: any): string {
//         var colName = s.retrieveInBetween2("[", "]");
//         var colValue = row ? row[colName] : 0;

//         if (!row)
//             this.evalParserStringTemp += this.getNextPlaceholder();     // x1, x2, x3, ...
//         else
//             row.parserValues.push(colValue);

//         s = s.removeTill("]", true);
//         return s;
//     }

//     private isSaneNumber(myVar: any): boolean {
//         if (isNaN(myVar)) return false;
//         if (myVar == Number.POSITIVE_INFINITY || myVar == Number.NEGATIVE_INFINITY) return false;
//         return true;
//     }

//     private getNextPlaceholder() {
//         var xx = "x" + this.__ph;
//         this.__ph++;
//         return xx;
//     }

//     // -----------------------------------------------------------------
//     //"sum", "max", "min", "avg", "count", "groupvalue", "groupvaluecount", "groupvaluefull", "groupvaluefullcount"
//     // -----------------------------------------------------------------
//     public setAggregate(column: string, aggregate: string, formulaUse?: boolean) {
//         var self = this;

//         // if formulaUse not given we assume it is NOT used for that purpose
//         if (!formulaUse) formulaUse = false;
        
//         // lower case incoming params
//         column = column.toLowerCase();
//         aggregate = aggregate.toLowerCase();

//         // find any possible existing one
//         var aggCol: AggregateColInfo = this.aggregateColInfos.find((ai: AggregateColInfo) => { return ai.column == column && ai.aggregate == aggregate; });

//         // if an existing one is there ..
//         if (aggCol) return;

//         // add to the list
//         this.aggregateColInfos.push(new AggregateColInfo(column, aggregate, formulaUse));

//     }
    
//     // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    
//     private totalsRowInternal: any = {};        // pure internal use for when we have no grouping but we have formula's that have aggregates within them..

//     // --------------------------------------------------------------------------------------
//     // Called each time anything changes regarding the raw data (baseDataFiltered) - 
//     // All data is given and we recalc the footer row.
//     // --------------------------------------------------------------------------------------
//     public calculateTotalAggregates(rows: any[]) {

//         // check if there is work to be done
//         if (rows.length == 0) return;

//         // check if totals row exists and if not create and prepare one
//         var checkforTotalsRow = () => {
//             if (this.totalsRow) return;

//             // simply create a new totals Row based on the first row...
//             this.totalsRow = $.extend(true, {}, rows[0])

//             // for all its own properties set all these to ""
//             _.forOwn(this.totalsRow, (val, colName) => this.totalsRow[colName] = "")
//             this.totalsRow.__isFooter = true;
//         }

//         // get a hold on the data ready for linq
//         var enumerable = Enumerable.from(rows);

//         // prepare any currency aggregate columns - NOTE - these are non observables
//         _.each(this.currencyAggregates, (currColumn: string) => {

//             // check if totals row exists and if not create one
//             checkforTotalsRow();        

//             var dist = enumerable.distinct(function (x) { return x[currColumn]; });
//             var currRows = dist.toArray()
//             if (currRows.length == 1)
//                 this.totalsRow[currColumn] = currRows[0][currColumn];
//             else
//                 this.totalsRow[currColumn] = "MIXED";
//         });

//         // step through all ColInfo's to do the sums
//         _.each(this.aggregateColInfos, (aggColInfo: AggregateColInfo) => {

//             // NOTE - there is a chance that a currencyAggregate also has another Aggregate (currency col in valuation classic example)
//             if (_.includes(this.currencyAggregates, aggColInfo.column)) return true;

//             // aggregate none does not count! (so lets NOT create the totals row for that... which would trigger the totals bar at bottom) 
//             if (aggColInfo.aggregate == "none") return true;

//             // check if totals row exists and if not create one
//             checkforTotalsRow();        

//             // calculate the aggregate value
//             var v: any;
//             if (aggColInfo.aggregate == "sum")
//                 v = enumerable.sum(function (x) { return x[aggColInfo.column]; });
//             else if (aggColInfo.aggregate == "max")
//                 v = enumerable.max(function (x) { return x[aggColInfo.column]; });
//             else if (aggColInfo.aggregate == "min")
//                 v = enumerable.min(function (x) { return x[aggColInfo.column]; });
//             else if (aggColInfo.aggregate == "avg")
//                 v = enumerable.average(function (x) { return x[aggColInfo.column]; });
//             else if (aggColInfo.aggregate == "count")
//                 v = enumerable.count(function (x) { return x[aggColInfo.column]; });
//             else
//                 v = "";

//             var prop = "__formula_internal_" + aggColInfo.column + "_" + aggColInfo.aggregate;
//             this.totalsRowInternal[prop] = v;

//             // if not for formula use (as in: the user requested this aggregate specifically) - NOTE, it doens't 
//             // really matter that the user might be aggregating on avg - this is a total row so will do totals!

//             // put that in the observable ready to display
//             this.totalsRow[aggColInfo.column] = v;
            
//         });

//     }

//    // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//     private __id: number = 0;
//     private headerRowsMngr: HeaderRowMngr = new HeaderRowMngr()
//     private groupHeaderPKValueCounter: number = -1
//     private groupingColumnsReverse: string[]
//     public rowsStructured: any[] = [];                      // ALL grouped items nicely structured with formula's filled in
    
//     // -------------------------------------------
//     // calc the grouping data
//     // -------------------------------------------
//     private calcGroupingData(rows: any[], groupingColumns: string[]) {

//         // if there is nothing to do then stop 
//         if (groupingColumns.length == 0 || rows.length == 0)
//             return rows
            
//         // get the grouping columns we need to group on
//         var groupCols: string[] = groupingColumns.slice(0)

//         // reset the start of negative pkvalue assigning of the groupheaders
//         this.groupHeaderPKValueCounter = -1;

//         // ---------------------------------------------------------
//         // check if we need to introduce another base level (in case of multiple top rows)
//         // ---------------------------------------------------------
//         var groupColName: string = groupCols[0]

//         // get distinct groups for this groupColName
//         var groupRows: any = Enumerable.from(rows).distinct(function (x) { return x[groupColName]; })
//         groupRows = groupRows.toArray()

//         // if we have more than 1 group then introduce an artificial top group to capture things like 'sum' etc for the real top most groups.
//         if (groupRows.length > 1) {
//             // insert a fictitious field that we can group on to get a master(total) outer group
//             groupCols.unshift("__mybasetemp")

//             // add this temp field to each row
//             _.each(rows, r => r.__mybasetemp = 0)
//         }

//         // reverse the groupingColumns - always start from the bottom for grouping
//         this.groupingColumnsReverse = groupingColumns.slice(0).reverse();

//         // now iterate through all this data
//         this.processGrouping(groupCols, rows);  
        
//         // remove the extra row we might have introduced...
//         //_.remove(rows, (item: any) => item.__groupColName == "__mybasetemp" );
        
//         return this.rowsStructured;                        
//     }

//     //private collapsingLevel: number = 99;

//     // ------------------------------
//     // start grouping all relevant raw rows with the given grouping cols
//     // - is called recursively till the groupCols array is consumed fully
//     // ------------------------------
//     private processGrouping(groupCols: string[], rows: any) {
        
//         // stop if there are no more groups to process
//         if (groupCols.length == 0) return; 
            
//         // get the group column name
//         var groupColName: string = groupCols[0];

//         // get distinct groups for this groupColName
//         var groupRows: any = Enumerable.from(rows).distinct((x: any) => x[groupColName]);

//         // order by group name always in asc order
//         groupRows = this.performEnumerableSort(groupRows, groupColName, "asc");

//         // cast to array
//         groupRows = groupRows.toArray();

//         // scan through these distinct rows and create new group rows from them
//         _.each(groupRows, (distinctItem: any) => {

//             // get the value of the column we are grouping on
//             var groupColNameValue = distinctItem[groupColName];

//             // get a sub set of rows for each value (USD, GBP)
//             var subGroupRows1: any = Enumerable.from(rows).where((x: any) => x[groupColName] == groupColNameValue);

//             // if need to do sorting then do so
//             subGroupRows1 = this.performEnumerableSort(subGroupRows1, this.sortColumn, this.sortDirection);

//             // cast the enumerable to a real array I can work on
//             var subGroupRows: any[] = subGroupRows1.toArray();

//             // create a new group row for this sub group
//             var newGroupRow = this.createGroupHeaderRow(groupColName, subGroupRows, subGroupRows1, distinctItem, groupCols);
//             this.rowsStructured.push(newGroupRow);

//             // hang on to this header row
//             this.headerRowsMngr.add(newGroupRow.__groupLevel, newGroupRow);

//             // blank out relevant fields 
//             if (newGroupRow.__groupLevel == 0) {
//                 debugger;
//             }
//             //if (self.clearGroupColumnDataWherePossible && newGroupRow.__groupLevel > 0) {
//             //     for (var i = newGroupRow.__groupLevel - 2; i >= 0; i--) {
//             //         var fieldToClear = self.groupingColumnsReverse[i];
//             //         newGroupRow[fieldToClear] = "";
//             //     }
//             // }

//             // add the section of rows to the self.sortedRows (only when we are on lowest level!)
//             if (groupCols.length == 1) {
//                 _.each(subGroupRows, (row: any) => {
//                     row.__id = this.__id++;
//                     row.__parentRow = newGroupRow;                  // hang on to my full parent (for internal aggregate lookup)
//                     row.__parentRowID = newGroupRow.__id;           // keep a ref id to our parent
//                     this.rowsStructured.push(row);                            // push onto our list
//                 });
//             }

//             // now iterate if there are more items - reduce the cols array (but do NOT amend the original)
//             this.processGrouping(groupCols.slice(1), subGroupRows);
//         });
//     }

//     // create a group header row
//     private createGroupHeaderRow(groupColName: string, subGroupRowsIn: any, enumerableGroupRows: any, 
//             distinctItem: any, cols: string[]): any {

//         // create new groupheader row for this group and do its sums now!
//         var newRow = $.extend(true, {}, distinctItem);
//         //var newRow = Object.assign({}, distinctItem) 

//         // new new new - clear out ALL properties before working with this row...
//         _.forOwn(newRow, (v, k) => newRow[key] = undefined);

//         // get an Enumerable from the given array
//         var subGroupRows: any = Enumerable.from(subGroupRowsIn);

//         // we created a new ad hoc row so set the group properties
//         newRow.__id = this.__id++;
//         newRow.__groupRowCount = subGroupRows.count();    // hang on to the number of rows for this group
//         newRow.__groupLevel = cols.length;                // so groupLevel will ALWAYS be 1 and higher!!   -- // 0 is normal row, 1 is the level above, 2 above that, etc.  - 
//         newRow.__groupLevelInverse = (this._groupingColumns.length) - cols.length
//         newRow.__groupColName = groupColName;
//         newRow.__isGroupHeader = true;
//         newRow.__isExpanded = true;
//         // newRow.__groupColour = this.groupingDefaultBackColour;
//         // if (this.groupingBackColours.hasOwnProperty(groupColName))
//         //     newRow.__groupColour = this.groupingBackColours[groupColName];

//         //newRow.__pkvalue = this.groupHeaderPKValueCounter--;      // what good is a __pkvalue if never used?
//         if (newRow.hasOwnProperty('pkvalue')) {
//             newRow.pkvalue = "000" + this.groupHeaderPKValueCounter--;   // i.e. "000-3"
//         }

//         // make sure we overwrite the id_column with the pkvalue (otherwise we have multiple idValues! (normal row and its rowgrouper)


//         // 
//         var parentHeaderRow: HeaderRow = this.headerRowsMngr.getRow(newRow.__groupLevel + 1);
//         if (parentHeaderRow) {
//             newRow.__parentRow = parentHeaderRow.row
//             newRow.__parentRowID = parentHeaderRow.row.__id
//         }
//         else {
//             newRow.__parentRow = {}
//             newRow.__parentRowID = -1
//         }

//         // blanketly collapse if this group needs full on collapse
//         if (_.includes(this._allCollapsedHeaders, groupColName)) newRow.__isExpanded = false

//         // if this specific key is expanded/collapsed by the user then override 
//         var key: string = this.createKey(newRow)
//         if (this._expandedHeaders.indexOf(key) > -1)
//             newRow.__isExpanded = true
//         else if (this._collapsedHeaders.indexOf(key) > -1)
//             newRow.__isExpanded = false

//         // check if we need to overwrite the __isExpanded property
//         //if (_.includes(this._allExpandedHeaders, groupColName)) newRow.__isExpanded = true
        

//         // prepare any currency aggregate column
//         this.currencyAggregates.forEach(function (currColumn: string) {
//             var dist = enumerableGroupRows.distinct((x: any) => x[currColumn]);
//             var currRows = dist.toArray()
//             if (currRows.length == 1)
//                 newRow[currColumn] = currRows[0][currColumn]
//             else
//                 newRow[currColumn] = "MIXED"
//         });

//         // scan for groupAggregate columns and perform the correct aggregate and place these into the group row
//         // for (var prop in distinctItem) {
//         //     if (distinctItem.hasOwnProperty(prop)) {
//         _.forOwn(distinctItem, (val, colName) => {    

//                 // get a list of aggregates to calculate
//                 var aggInfos: AggregateColInfo[] = this.aggregateColInfos.filter(function (ai: AggregateColInfo) { return ai.column == colName; });

//                 // step through each of these 
//                 aggInfos.forEach(function (aggInfo: AggregateColInfo) {
//                     var newValue = 0

//                     if (aggInfo.aggregate == "sum")
//                         newValue = subGroupRows.sum((x: any) => x[colName]);
//                     if (aggInfo.aggregate == "avg")
//                         newValue = subGroupRows.average((x: any) => x[colName]);
//                     if (aggInfo.aggregate == "max")
//                         newValue = subGroupRows.max((x: any) => x[colName]);
//                     if (aggInfo.aggregate == "min")
//                         newValue = subGroupRows.Min((x: any) => x[colName]);
//                     if (aggInfo.aggregate == "count")
//                         newValue = subGroupRows.Count((x: any) => x[colName]);
                    
//                     // if this agginfo formula is for formula use then hang on to it in a special way...
//                     if (aggInfo.formulaUse)
//                         newRow["__formula_internal_" + colName + "_" + aggInfo.aggregate] = newValue;
//                     //else
                    
//                     // write out the aggregate value into the property of the grouping row
//                     newRow[colName] = newValue;

//                     // if (aggInfo.aggregate == "count") {
//                     //     newRow[colName] = subGroupRows.count(function (x) { return x[colName]; });
//                     // }

//                     //if (aggInfo.aggregate == "groupvalue") {                    // simply place the group value 
//                     //    newRow[colName] = newRow[groupColName];
//                     //}

//                     // NOTE - below not too elegant but clear and ready to be changed around - mike now want to get rid of _full and introduce a named equivalent
//                     if (aggInfo.aggregate.startsWith("groupvalue")) {

//                         var thevalue = newRow[groupColName];
                        
//                         if (aggInfo.aggregate == "groupvalue")                
//                             newRow[colName] = thevalue;

//                         if (aggInfo.aggregate == "groupvaluecount") {               
//                             var count: number = subGroupRows.count((x: any) => x[colName]);
//                             newRow[colName] = thevalue + " [" + count + "]";
//                         }

//                         if (aggInfo.aggregate == "groupvaluefull") {
//                             if (newRow.hasOwnProperty(groupColName + "_full"))
//                                 thevalue = newRow[colName] = newRow[groupColName + "_full"];
//                             newRow[colName] = thevalue;
//                         }

//                         if (aggInfo.aggregate == "groupvaluefullcount") {               
//                             if (newRow.hasOwnProperty(groupColName + "_full"))
//                                 thevalue = newRow[colName] = newRow[groupColName + "_full"];
//                             var count: number = subGroupRows.count((x: any) => x[colName]);
//                             newRow[colName] = thevalue + " [" + count + "]";
//                         }

//                     }

//                 });

//         })

//         return newRow;
//     }

//     // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

     
//     // public allCollapsedLevels: KnockoutObservableArray<number> = ko.observableArray<number>();     // identifies the level number that is collapsed entirely
//     // public allExpandedLevels: KnockoutObservableArray<number> = ko.observableArray<number>();      // identifies the level number that are expanded entirely

//     // // called through the header (a grouping column - entire level)
//     // public expandCollapseAll(level: number) {
//     //     var self = this;

//     //     // if all groups on this level are expanded then this has an entry so we need to collapse
//     //     var collapse: boolean = this.allExpandedLevels.indexOf(level) > -1;

//     //     if (collapse && self.allCollapsedLevels.indexOf(level) == -1)
//     //         self.allCollapsedLevels.push(level);

//     //     if (collapse && self.allExpandedLevels.indexOf(level) == -1)
//     //         self.allExpandedLevels.push(level);

//     //     // step through all prepared group rows and adjust where needed
//     //     $.each(this.baseDataStructured, function (index, item: any) {
//     //         if (item.__isGroupHeader) {
//     //             var levelTemp = item.__groupLevel;
//     //             if (levelTemp == level) {
//     //                 item.__isExpanded = !collapse;

//     //                 // create the key
//     //                 var key: string = self.createKey(item);

//     //                 // remove the entry if it exists
//     //                 self.collapsedHeaders.remove(key);

//     //                 // add only if now collapsed
//     //                 if (collapse)
//     //                     self.collapsedHeaders.push(key);
//     //             }
//     //         }
//     //     });

//     //     // check the current setting for expand/collapsed and update the rows the user is allowed to actually see
//     //     this.postExpandCollapsePrepareDisaplyable();        // ** updates up the baseDataDisplayable
//     // }

//     // //  
//     // public checkExpandedCollapsedHeaders() {

//     //     var self = this;
//     //     //self.allCollapsedLevels().length = 0;
//     //     //self.allExpandedLevels().length = 0;

//     //     //var groupings: string[] = this.controller.definition.activeStyle().groupingColumns;
        

//     //     // trick
//     //     var underlyingAllCollapsedLevels = self.allCollapsedLevels();
//     //     var underlyingAllExpandedLevels = self.allExpandedLevels();

//     //     // remove all items 
//     //     underlyingAllCollapsedLevels.length = 0;
//     //     underlyingAllExpandedLevels.length = 0;

//     //     // step through
//     //     var groupings: string[] = this.groupingColumns;   
//     //     for (var level: number = 1; level <= groupings.length; level++) {

//     //         underlyingAllCollapsedLevels.push(level);
//     //         underlyingAllExpandedLevels.push(level);

//     //         // step through all prepared group rows and adjust where needed - so we start off from a position where we assume that this level is BOTH in 
//     //         // the collapsed as well as expanded levels (this can't be thh case 
//     //         $.each(this.baseDataStructured, function (index, item: any) {
//     //             if (item.__isGroupHeader) {
//     //                 var levelTemp = item.__groupLevel;
//     //                 if (levelTemp == level) {
//     //                     if (item.__isExpanded && underlyingAllCollapsedLevels.indexOf(level) > -1)
//     //                         underlyingAllCollapsedLevels.remove(level);
//     //                     if (!item.__isExpanded && underlyingAllExpandedLevels.indexOf(level) > -1)
//     //                         underlyingAllExpandedLevels.remove(level);
//     //                 }
//     //             }
//     //         });
//     //     }

//     //     // then tell knockout it has changed so the ui updates itself
//     //     self.allCollapsedLevels.valueHasMutated();
//     //     self.allExpandedLevels.valueHasMutated();

//     // }

//     // // Called when groupheader expand/collapse is clicked
//     // // We can't store the pkvalue since if new data is thrown at it we still have to expand/collapse properly 
//     // public selectExpandCollapsed(pkvalue: string) {         // item: __dsi.DSItem

//     //     // find the row the user clicked on and find out what state it currently is in.
//     //     var row: any = this.baseDataStructured.findItem(function (cb) { return cb.pkvalue == pkvalue; });
//     //     if (!row) throw new Error("Can't find row with pkvalue: " + pkvalue);

//     //     // 
//     //     var wasCollapsed: boolean = !row.__isExpanded;
//     //     var level: number = row.__groupLevel;

//     //     // remember
//     //     if (wasCollapsed)
//     //         this.allCollapsedLevels.remove(level);
//     //     else
//     //         this.allExpandedLevels.remove(level);

//     //     // no point setting the Expanded property on the DSItem - we need to set it on the base array
//     //     row.__isExpanded = !row.__isExpanded;

//     //     // construct a unique key
//     //     var key: string = this.createKey(row);

//     //     // simply remove the collapsed header if it exists
//     //     this.collapsedHeaders.remove(key);

//     //     // if it is in collapsed state then we hold on to it (expanded is the default)
//     //     if (!row.__isExpanded)
//     //         this.collapsedHeaders.push(key);

//     //     // check the current setting for expand/collapsed and update the rows the user is allowed to actually see
//     //     this.postExpandCollapsePrepareDisaplyable();        // ** updates up the baseDataDisplayable
//     // }

//     // creates a unique key for the given headerRow (so it can be re-identified for collapse/expand)
//     private createKey(row: any): string {
//         var level: number = row.__groupLevelInverse;
//         if (level < 0) return "nonexistent"

//         var colName: string = this._groupingColumns[level]
//         var colValue: string = row[colName]

//         var key: string = "|"
//         _.each(this._groupingColumns, (col) => {
//             key += `${col}_${row[col]}|`
//             if (col == colName) return false 
//         })
//         return key;

//     }

//     // ----------------------------------------------------------
//     // NOTE - This is where we actually fill the rows we allow the user to see! (the clever bit)
//     // ----------------------------------------------------------
//     private postExpandCollapsePrepareDisaplyable(rows: any[]): any[] {

//         var self = this;

//         //var reversedGroupes = this._groupingColumns.reverse()
//         _.each(this._groupingColumns, (groupCol, index) => {
            
//             // filtered rows for the appropriate group level
//             var filteredRows = _.filter(rows, r => r.__groupLevel == this._groupingColumns.length - index)

//             // distinct this filtered set - if single row then either expanded or collapsed, else it is mixed
//             var enumerable = Enumerable.from(filteredRows);
//             var dist = enumerable.distinct(function (x: any) { return x.__isExpanded; });
//             var arr: any[] = dist.toArray()
//             if (arr.length == 1)
//                 this._stateExpCol.set(groupCol, arr[0].__isExpanded ? "expanded" : "collapsed")
//             else
//                 this._stateExpCol.set(groupCol, "mixed")

//         })

//         // prepare empty return array
//         var retRows: any[] = []

//         // a level marker
//         var markLevel = -1

//         // iterate through and ignore any child rows from a parent that is collapsed
//         _.each(rows, function (item: any) {

//             var isGroupHeader = item.__isGroupHeader;
//             var level = item.__groupLevel;      // 

//             if (isGroupHeader) {
//                 var isCollapsed = !item.__isExpanded;

//                 if (isCollapsed && level >= markLevel) {
//                     retRows.push(item);
//                     markLevel = level;
//                 }
//                 else if (level >= markLevel) {
//                     markLevel = -1;
//                     retRows.push(item);
//                 }
//                 else if (level < markLevel) {
//                     // ignore
//                 }
//                 else
//                     retRows.push(item);
//             }
//             else {
//                 if (markLevel == -1)
//                     retRows.push(item);
//             }
//         });

//         return retRows;

//     }

//     // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// }



// // export class EngineInfo {
// //     public rows: any
// //     public sortColumn: string = ""
// //     public sortDirection: string = ""
// //     public formulas: string[] = []
// //     public grouping: string[] = []
// // }

// // helper class
// export class AggregateColInfo {
//     constructor(public column: string, public aggregate: string, public formulaUse: boolean) {
//     }
// }

// // helper class - formula
// export class FormulaColInfo {
//     public evalParser: any;
//     constructor(public column: string, public formula: string, public evalFormula: string) {
//     }
// }

// // helper class - manages header row references
// export class HeaderRowMngr {

//     private rows: HeaderRow[] = [];

//     public add(level: number, row: any) {
//         _.remove(this.rows, (item: HeaderRow) => { return item.level == level; });
//         this.rows.push(new HeaderRow(level, row));
//     }
    
//     public getRow(level: number): HeaderRow {
//         var item: HeaderRow = _.find(this.rows, (item: HeaderRow) => { return item.level == level; });
//         return item;
//     }

// }

// // helper class - wrapper aroung a header row
// export class HeaderRow {
//     constructor(public level: number, public row: any) {
//     }
// }

