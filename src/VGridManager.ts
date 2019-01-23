import * as _ from 'lodash';
import * as $ from 'jquery';
import Vue from 'vue';
import * as Enumerable from 'linq'
import * as __core from './core';
import GridMain from './components/GridMain.vue';
import { GridColumn } from './GridColumns';
import { VGridSettings, CellStyleInfo } from './index';
import { VGridState } from './VGridState';
import createStore from './Store';

// -------------------------------------------------------
// VGridManager
// -------------------------------------------------------
export class VGridManager {
	
	static x: boolean = false;		// used by engine\engine.ts(28,26)

	static processCurrency(row, colDef, settings: VGridSettings, style: CellStyleInfo) {
            let colName: string = colDef.dbName;
            let colCurrLookup = settings.currencyLookupColumn;

            let currCols : string[] = settings.currencyColumns;
            if (!currCols.includes(colName)) return;

            // initialise the currency
			let currCode = row[colCurrLookup];

			// check special case for when we are dealing with a total row
			if (style.isGroupRow) {
				currCode = row.__groupCurrencyCode;
            }
            
            // check special case for when we are dealing with a total row
			if (style.isTotalRow) {
				// check if there is a single currency in this (sub)group
				let enumerable = Enumerable.from(style.rows);
				let distinctRows = enumerable.select(r => r[colCurrLookup]).distinct().toArray();
				currCode = distinctRows.length == 1 ? distinctRows[colCurrLookup] : "MIXED";
            }
            
            // 
            let curr = settings.getCurrencySymbol(currCode);
			
			//
            style.textDisplay = `${curr} ${style.textDisplay}`;
            
	}

	static createGrid(settings: VGridSettings): any {

		// create a new temp element that Vue will replace with the grid
		let $new = $('<span></span>');

		// append this to the element in which we should inject the grid
		$new.appendTo($(<any>settings.el)[0]);

		// clear out the .el prop since it would cause issues further down the line ... 
		settings.el = null;		// $new[0];

		// create a new VGridState 
		let mystate : VGridState = new VGridState();
		//mystate.rowsRaw = [];
		//mystate.rowsPrepared = mystate.rowsRaw;		// dreadfully slow - HAS to be assigned AFTER store is created
		
		// if a previous columns state was handed in then apply that
		if (settings.settings) {
			let colsTemp = JSON.parse(settings.settings);
			mystate.columns = _.map(colsTemp, colitem => GridColumn.create(colitem));
		}
		else
			mystate.columns = settings.columns;

		// hang on to the incoming v-settings object through the state so we can
		// access this easily deeper down in the widgets...
		mystate.settings = settings;

		// -----------------------------------------
		// check if columns have aggregates, if show we need to show the totals footer
		mystate.showTotalsRow = mystate.columns.hasItem(col => col.isAggregate);
		// -----------------------------------------

		// -----------------------------------------
		// check if columns have a sort set
		// -----------------------------------------
		let colsTemp = mystate.columns.filter(c => c.order >= 0).sort((a,b) => a.order - b.order);
		colsTemp.forEach((c, index) => c.order = index);
		let colsTempZeros = mystate.columns.filter(c => c.order == -1);
		colsTempZeros.forEach((c, index) => c.order = (index + colsTemp.length));
		mystate.columns = colsTemp.concat(colsTempZeros);

		// -----------------------------------------
		// create the Store given the current state
		// -----------------------------------------
		let vstore = createStore(mystate);

		// ----------------------------------------------------------------------------------------
		// NOTE NOTE - HAS TO BE DONE from 'outside' attach the data props to prevent 
		// being part of the 'reactive' system
		// ----------------------------------------------------------------------------------------
		mystate.rowsPrepared = mystate.rowsRaw;

		// ok, create the grid Vue control
		let vm = new Vue({
			el: $new[0],
			store: vstore,
			components: { GridMain },
			template: `
					<div class="vg-grid flex-nested-start flex-parent-col">
							<GridMain></GridMain>
					</div>
			`,
			mounted() {	
				if (settings.createdGridStructure) {
					// allow the creation call to be finished first so disconnect! - this allows the
					// client to get a ref to the new grid first before the even is raised, possibly allowing
					// new data to be given to the grid at that point.
					setTimeout(() => settings.createdGridStructure(settings.vgrid));
				}

			}
		})

		// return the key parts
		return {vm, store: vstore};
	 
	}
}

