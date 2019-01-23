import * as Enumerable from 'linq'
import * as _ from 'lodash'
import * as $ from 'jquery'
import { GridColumn} from '../GridColumns'
import { performEnumerableSort, EngineOptions, VueEngineResult } from './engine_utils'
import { VueGridEngineGrouper } from './engine_grouping'
import { VGridManager } from '../VGridManager';

//let P: any = require('./parser')
//let Parser = P.Parser

//declare let Parser;     // allows the use of the Parser js library without any further type checking. 

export class VueGridEngine {
    
    private sortColumn: string = "";
    private sortDirection: string = "";
    //private groupingColumns: string[] = [];
    
    // ----------------------------------
    // (Re)Calculate every single time on change of circumstance
    // ----------------------------------
    public processData(rows: any[], options: EngineOptions): VueEngineResult {
        
        // hand over
        //this.groupingColumns = options.groupingColumns;
        if (VGridManager.x)
            return new VueEngineResult([], {}, {});

        // 1. prepare raw rows (clones the given rows!)
        rows = this.prepareRows(rows)
        
        // 3. sort the filtered rows
        rows = this.setSortColumnDetails(rows, options.cols);

        // 4. calulate the totals row
        let totalsRow = this.calcTotalsRow(rows, options.cols);

        // 4. group the rows (if need be)
        let grouper = new VueGridEngineGrouper();
        rows = grouper.calcGroupingData(rows, options);

        // 5. calc formula        
        //this.processFormulas(rows);     // process any formulas
        
        // remove some parent row references
        rows = this.cleanUp(rows)

        // return the data
        return new VueEngineResult(rows, totalsRow, {});
    }

    // attach some properties to every row that we need for grouping    
    private prepareRows(rows:any) {
        return _.map(rows, (row: any) => {
            row.__groupRowCount = 0;                
            row.__groupLevel = 0                // 0 is normal row, 1 is the level above, 2 above that, etc.  - 
            row.__groupLevelInverse = -1;       // this._groupingColumns.length; 
            row.__groupColName = ""
            row.__isExpanded = true;
            row.__isGroupHeader = false
            row.__parentRow = ""
            row.__parentRowID = -1
            row.__isFooter = false
            return row
        })
    }

    private cleanUp(rows: any[]) {

        // remove the top most grouprow if it exists
        _.remove(rows, r => r.__groupColName == "__mybasetemp")

        // go through all rows and remove what it not necessary
        let rowsOut = _.map(rows, m => {    
            delete m.__parentRow
            delete m.__parentRowID
            return m
        })

        return rowsOut
    }

    private setSortColumnDetails(rows: any, cols: GridColumn[]): any {
        let match: GridColumn = _.find(cols, (column: GridColumn) => column.sortDirection.length > 0);
        this.sortColumn = match ? match.dbName : ""
        this.sortDirection = match ? match.sortDirection : ""  
        if (!match) return rows;

        // do a nasty quick check if this is a date make sure there are no 'null' values
        if (match.type.isSame("date")) {
            rows.forEach((r: any) => {
                if (!r[match.dbName])
                    r[match.dbName] = "1900-01-01T00:00:00";
            });
        }

        let enumerableGroup = Enumerable.from(rows);
        enumerableGroup = performEnumerableSort(enumerableGroup, this.sortColumn, this.sortDirection);
        rows = enumerableGroup.toArray();

        // undo the nasty trick
        if (match.type.isSame("date")) {
            rows.forEach((r: any) => {
                if (r[match.dbName] == "1900-01-01T00:00:00")
                    r[match.dbName] = null;
            });
        }
        
        return rows
    }
    
    //--------------
    
    private calcTotalsRow(rows: any, cols: GridColumn[]): any {

        let enumerableGroup = Enumerable.from(rows);

        let totalsRow: any = {};

        // find the aggregate column
        cols = _.filter(cols, (column: GridColumn) => column.isAggregate);

        // step through each column and perform the aggregate
        cols.forEach(c => totalsRow[c.dbName] = this.CalcAggregate(enumerableGroup, c));

        return totalsRow;
    }

    private CalcAggregate(enumerableObj: any, col: GridColumn) {
        if (col.aggregate.isSame("sum"))
            return enumerableObj.sum(x => x[col.dbName]);
        else if (col.aggregate.isSame("avg"))
            return enumerableObj.average(x => x[col.dbName]);
        else if (col.aggregate.isSame("max"))
            return enumerableObj.max(x => x[col.dbName]);
        else if (col.aggregate.isSame("min"))
            return enumerableObj.min(x => x[col.dbName]);
    }

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

