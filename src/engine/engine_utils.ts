import { GridColumn} from '../GridColumns'

const performEnumerableSort = (enumerableObj: any, sortOnColumn: string, sortDirection: string) => {
	// if need to do sorting then do so
	if (sortOnColumn.length > 0) {
		if (sortDirection == "asc")
			enumerableObj = enumerableObj.orderBy("x=>x." + sortOnColumn);
		else
			enumerableObj = enumerableObj.orderByDescending("x=>x." + sortOnColumn);
	}
	return enumerableObj;
}

export class EngineOptions {
    public cols: GridColumn[] = [];
    public groupingColumns: string[] = [];
    public groupDisplayMode: string = 'VALUEWITHCOUNT';
    public colCurrLookUp: string = "";
    //public expandedHeaders: string[] = [];
    public collapsedHeaders: string[] = [];
    //public allCollapsedHeaders: string[] = [];
    public returnFullSet: boolean = false;
}

export class VueEngineResult {
    constructor(
        public rows: any = {},
        public totalsRow: any = {},
        public stateExpCol: any = {}
    ) {}
}

export { performEnumerableSort };

