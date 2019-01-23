// import * as Enumerable from 'linq'
// import * as _ from 'lodash'
// import * as R from 'ramda'
// import * as $ from 'jquery'
// import { GridColumn} from '../GridColumns'
// import { performEnumerableSort } from './engine_utils'

// //var P: any = require('./parser')
// //var Parser = P.Parser

// //declare var Parser;     // allows the use of the Parser js library without any further type checking. 

// export class VueGridEngineGrouper {
    
//     public sortColumn: string = ""
//     public sortDirection: string = ""
//     public formulaColInfos: FormulaColInfo[] = [];             // info regarding formula columns
//     public _groupingColumns: string[] = []
 
// 	private currencyAggregates: string[] = [];                   // the column grouping structure
// 	private aggregateColInfos: AggregateColInfo[] = [];         // info regarding aggregate columns

// 	private _hasGrouping: boolean = false;
// 	private _groupDisplayMode: string = "";
// 	//private _allExpandedHeaders: string[]
// 	private _allCollapsedHeaders: string[] = [];

//     private _expandedHeaders: string[] = [];    // hang on to the collapsed headers so when we redo grouping or sorting etc we can initialise the correct header rows again
//     private _collapsedHeaders: string[] = [];    // hang on to the collapsed headers so when we redo grouping or sorting etc we can initialise the correct header rows again
//     private _stateExpCol: Map<string, string> = new Map<string, string>()


//    // --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//     private __id: number = 0;
//     private headerRowsMngr: HeaderRowMngr = new HeaderRowMngr()
//     private groupHeaderPKValueCounter: number = -1
//     private groupingColumnsReverse: string[]
//     public rowsStructured: any[] = [];                      // ALL grouped items nicely structured with formula's filled in
    
//     // -------------------------------------------
//     // calc the grouping data
//     // -------------------------------------------
//     public calcGroupingData(rows: any[], groupingColumns: string[]) {

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
//         groupRows = performEnumerableSort(groupRows, groupColName, "asc");

//         // cast to array
//         groupRows = groupRows.toArray();

//         // scan through these distinct rows and create new group rows from them
//         _.each(groupRows, (distinctItem: any) => {

//             // get the value of the column we are grouping on
//             var groupColNameValue = distinctItem[groupColName];

//             // get a sub set of rows for each value (USD, GBP)
//             var subGroupRows1: any = Enumerable.from(rows).where((x: any) => x[groupColName] == groupColNameValue);

//             // if need to do sorting then do so
//             subGroupRows1 = performEnumerableSort(subGroupRows1, this.sortColumn, this.sortDirection);

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
//         R.forEach(key => { newRow[key] = undefined; }, R.keys(newRow));

//         // re-insert the groupColName's value... so it can be easily displayed
//         newRow[groupColName] = distinctItem[groupColName];

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
//                     // if (aggInfo.aggregate.startsWith("groupvalue")) {

//                     //     var thevalue = newRow[groupColName];
                        
//                     //     if (aggInfo.aggregate == "groupvalue")                
//                     //         newRow[colName] = thevalue;

//                     //     if (aggInfo.aggregate == "groupvaluecount") {               
//                     //         var count: number = subGroupRows.count((x: any) => x[colName]);
//                     //         newRow[colName] = thevalue + " [" + count + "]";
//                     //     }

//                     //     if (aggInfo.aggregate == "groupvaluefull") {
//                     //         if (newRow.hasOwnProperty(groupColName + "_full"))
//                     //             thevalue = newRow[colName] = newRow[groupColName + "_full"];
//                     //         newRow[colName] = thevalue;
//                     //     }

//                     //     if (aggInfo.aggregate == "groupvaluefullcount") {               
//                     //         if (newRow.hasOwnProperty(groupColName + "_full"))
//                     //             thevalue = newRow[colName] = newRow[groupColName + "_full"];
//                     //         var count: number = subGroupRows.count((x: any) => x[colName]);
//                     //         newRow[colName] = thevalue + " [" + count + "]";
//                     //     }

//                     // }

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

