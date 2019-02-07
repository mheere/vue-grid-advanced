
import { GridStateInfo, VGridSettings } from './index';
import { GridColumn } from './GridColumns';

// -------------------------------------------------------
// The Vue Grid's State (i.e. Store in the Redux model)
// -------------------------------------------------------
export class VGridState {
	
	public showFilterStyleBar: boolean = true;
	public showTotalsRow: boolean = false;
	public showGridColumns: boolean = false;
	public showGridSettings: boolean = false;

	public totalsRow: any = {};
	public rowsRaw: any[] = [];
	public rowsPrepared: any[];
	public rowsPreparedCount: number = -1;
	public visibleRowCount: number = 0;
	public startRow: number = 0;

	public columns: GridColumn[] = [];
	public groupingColumns: GridColumn[] = [];

	public clickedColumn: string = "";
	public dblClickedColumn: string = "";				// if given then there was dbl click 
	public isVertScrolling: boolean = false;
	
	public rowHeight: number = 24;
	public visibleHeight: number = 340;
	public vertScrollDiff: number = 0;
	public setVertScrollRatio: number = -1;			// -1 do nothing - else VertScroll needs to act
	public hasHorzScrollbar: boolean = false;
	
	public gridKey: string = "";
	public isRefreshData: boolean = false;			// toggle this to force a total refresh !
	public settings: VGridSettings = undefined;
	public pageLastRefresh: string = "--";

	public selectedRow: any = undefined;			// the current selected 'main' row
	public selectedRowID: string = "";				// the pkvalue of the selected 'main' row
	public selectedRowIDs: string[] = [];			// an array of selected row pkvalues
	public checkedRowIDs: string[] = [];			// an array of checked row pkvalues

	public dragSourceColumnName: string = "";		// helper prop
	public dragTargetColumnName: string = "";		// helper prop
	public isColumnResizing: boolean = false;		// helper prop

	public gridStateInfo: GridStateInfo = undefined;

	public collapsedHeaders: string[] = [];
	public showGrouperBar: boolean = false;

}

